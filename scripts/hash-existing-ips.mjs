import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('./.env', import.meta.url), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]
    })
)

const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY
const SECRET = env.IP_HASH_SECRET

if (!SUPABASE_URL || !SERVICE_ROLE || !SECRET) {
  console.error('Missing env vars. Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, IP_HASH_SECRET.')
  process.exit(1)
}

if (!/^eyJ/.test(SERVICE_ROLE)) {
  console.error('SUPABASE_SERVICE_ROLE_KEY does not look like a Supabase JWT (should start with "eyJ").')
  process.exit(1)
}

const HEX64 = /^[0-9a-f]{64}$/i

async function hmacHex(value) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value.trim().toLowerCase()))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function migrateTable(supabase, table, idColumn, valueColumn) {
  let from = 0
  let hashed = 0

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(`${idColumn}, ${valueColumn}`)
      .range(from, from + 999)
    if (error) throw error
    if (!data.length) break

    for (const row of data) {
      const value = row[valueColumn]
      if (!value || HEX64.test(value)) continue
      const hash = await hmacHex(value)
      const { error: updateErr } = await supabase
        .from(table)
        .update({ [valueColumn]: hash })
        .eq(idColumn, row[idColumn])
      if (updateErr) throw updateErr
      hashed += 1
    }

    if (data.length < 1000) break
    from += 1000
  }

  return hashed
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

  const attempts = await migrateTable(supabase, 'submission_attempts', 'id', 'ip_address')
  const votes = await migrateTable(supabase, 'votes', 'id', 'vote_ip')
  console.log(`Hashed ${attempts} submission_attempts and ${votes} votes.`)

  const { data: restA, error: errA } = await supabase.from('submission_attempts').select('ip_address')
  if (errA) throw errA
  const { data: restB, error: errB } = await supabase.from('votes').select('vote_ip')
  if (errB) throw errB

  const remaining = [
    ...(restA ?? []).map((r) => r.ip_address),
    ...(restB ?? []).map((r) => r.vote_ip),
  ].filter((v) => v && !HEX64.test(v))

  if (remaining.length) {
    console.error(`WARNING: ${remaining.length} value(s) still look like plaintext IPs.`)
    process.exit(1)
  }

  console.log('Verification OK: no plaintext IPs remain.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})