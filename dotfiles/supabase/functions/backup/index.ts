import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GITHUB_API = 'https://api.github.com'

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function getFileSha(repo: string, path: string, token: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: githubHeaders(token),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to check ${path}: ${res.status}`)
  const data = await res.json()
  return data.sha
}

async function putFile(repo: string, path: string, base64Content: string, message: string, token: string) {
  const sha = await getFileSha(repo, path, token)
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...githubHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: base64Content,
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to write ${path}: ${res.status} ${body}`)
  }
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function extFromUrl(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/)
  return match ? match[1].toLowerCase() : 'jpg'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')
    const BACKUP_REPO = Deno.env.get('BACKUP_REPO')
    if (!GITHUB_TOKEN || !BACKUP_REPO) {
      throw new Error('GITHUB_TOKEN or BACKUP_REPO is not configured.')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const jwt = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || userData.user?.email !== 'zhaleff.core@gmail.com') {
      return new Response(JSON.stringify({ error: 'Forbidden.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: rices, error } = await supabase.from('rices').select('*')
    if (error) throw error
    console.log(`Fetched ${rices.length} rices.`)

    const dbJson = JSON.stringify(rices, null, 2)
    const dbBase64 = btoa(unescape(encodeURIComponent(dbJson)))
    await putFile(BACKUP_REPO, 'db/rices.json', dbBase64, `backup: db snapshot (${rices.length} rices)`, GITHUB_TOKEN)
    console.log('DB snapshot committed.')

    const failures: { id: string; url: string; error: string }[] = []
    let imagesBackedUp = 0

    const CONCURRENCY = 4
    const queue = []
    for (const rice of rices) {
      queue.push({ url: rice.image_url, suffix: 'full', id: rice.id })
      queue.push({ url: rice.thumbnail_url, suffix: 'thumb', id: rice.id })
    }
    const jobs = queue.filter((j) => !!j.url)
    console.log(`${jobs.length} images queued.`)

    async function processJob(job: { url: string; suffix: string; id: string }) {
      try {
        const imgRes = await fetch(job.url)
        if (!imgRes.ok) throw new Error(`Download failed: ${imgRes.status}`)
        const buffer = await imgRes.arrayBuffer()
        const base64 = toBase64(buffer)
        const ext = extFromUrl(job.url)
        const path = `images/${job.id}-${job.suffix}.${ext}`
        await putFile(BACKUP_REPO, path, base64, `backup: image ${job.id}-${job.suffix}`, GITHUB_TOKEN)
        imagesBackedUp++
      } catch (err) {
        console.error(`Image failed [${job.id}-${job.suffix}]: ${err.message}`)
        failures.push({ id: job.id, url: job.url, error: err.message })
      }
    }

    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
      const batch = jobs.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map(processJob))
      console.log(`Processed ${Math.min(i + CONCURRENCY, jobs.length)}/${jobs.length} images.`)
    }

    console.log(`Done. ${imagesBackedUp} succeeded, ${failures.length} failed.`)

    const meta = {
      last_backup_at: new Date().toISOString(),
      rice_count: rices.length,
      images_backed_up: imagesBackedUp,
      failures,
    }
    const metaBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(meta, null, 2))))
    await putFile(BACKUP_REPO, 'meta.json', metaBase64, `backup: meta (${new Date().toISOString()})`, GITHUB_TOKEN)

    await supabase.from('backup_log').insert({
      rice_count: rices.length,
      images_backed_up: imagesBackedUp,
      failures,
      success: failures.length === 0,
    })
    console.log('backup_log row inserted.')

    return new Response(JSON.stringify({ success: true, ...meta }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
