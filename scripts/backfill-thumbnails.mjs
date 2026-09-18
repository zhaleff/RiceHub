// One-time backfill: generates a compressed WebP thumbnail for every rice
// that doesn't have one yet, uploads it to ImgBB, and updates the row.
//
// Setup:
//   cd scripts
//   pnpm install
//
// Required env vars (put them in scripts/.env or export them):
//   SUPABASE_URL              — your project URL
//   SUPABASE_SERVICE_ROLE_KEY — service_role key (NOT anon — needed to bypass RLS)
//   IMGBB_API_KEY             — same key the app already uses
//
// Run:
//   pnpm backfill-thumbnails                  # real run
//   pnpm backfill-thumbnails -- --dry-run     # only report what would change
//
// Safe to re-run: only touches rows where thumbnail_url IS NULL.
// If an image fails, it's skipped and reported at the end — the script
// keeps going and never deletes or overwrites image_url.

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DRY_RUN = process.argv.includes('--dry-run')

// --- Load scripts/.env manually (no extra dependency) ---
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (!m) continue
    const key = m[1].trim()
    let value = m[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IMGBB_API_KEY = process.env.IMGBB_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !IMGBB_API_KEY) {
  console.error('Missing env vars. Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, IMGBB_API_KEY.')
  process.exit(1)
}

if (!SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
  console.error('SUPABASE_SERVICE_ROLE_KEY does not look like a Supabase JWT (should start with "eyJ").')
  console.error('Get it from: Supabase dashboard → Project Settings → API Keys → service_role (secret).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const PAGE_SIZE = 1000
const THUMB_MAX_WIDTH = 600
const THUMB_QUALITY = 60 // 0-100, matches the app's client-side 0.6

async function fetchRicesToBackfill() {
  const rices = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('rices')
      .select('id, title, image_url')
      .is('thumbnail_url', null)
      .not('image_url', 'is', null)
      .order('id')
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    rices.push(...data)

    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return rices
}

async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function makeThumbnailBuffer(inputBuffer) {
  return sharp(inputBuffer)
    .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer()
}

async function uploadToImgbb(buffer, filename) {
  const form = new FormData()
  form.append('image', new Blob([buffer]), filename)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: form,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.data?.url) {
    throw new Error(data?.error?.message || `imgbb upload failed (${res.status})`)
  }
  return data.data.url
}

async function main() {
  if (DRY_RUN) console.log('DRY RUN — nothing will be uploaded or updated.\n')

  console.log('Fetching rices without thumbnail_url...')
  const rices = await fetchRicesToBackfill()

  console.log(`Found ${rices.length} rice(s) to backfill.\n`)

  const failures = []
  let done = 0

  for (const rice of rices) {
    const label = `[${rice.id}] ${rice.title || '(untitled)'}`
    try {
      process.stdout.write(`Processing ${label}... `)

      if (DRY_RUN) {
        console.log(`would generate thumbnail from ${rice.image_url}`)
        continue
      }

      const original = await downloadImage(rice.image_url)
      const thumbBuffer = await makeThumbnailBuffer(original)
      const thumbnail_url = await uploadToImgbb(thumbBuffer, `${rice.id}-thumb.webp`)

      const { error: updateError } = await supabase
        .from('rices')
        .update({ thumbnail_url })
        .eq('id', rice.id)

      if (updateError) throw updateError

      done++
      console.log(`done (${(thumbBuffer.length / 1024).toFixed(0)}KB)`)
    } catch (err) {
      console.log('FAILED')
      failures.push({ id: rice.id, title: rice.title, error: err.message })
    }
  }

  console.log(`\n--- Summary ---`)
  console.log(`${DRY_RUN ? 'Would process' : 'Success'}: ${done}/${rices.length}`)
  if (failures.length) {
    console.log(`Failed: ${failures.length}`)
    for (const f of failures) {
      console.log(`  [${f.id}] ${f.title || '(untitled)'} — ${f.error}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})