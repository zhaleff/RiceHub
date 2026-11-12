export function generateSlug(author, title) {
  const base = `${author || 'anonymous'}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base}-${Math.random().toString(36).slice(2, 8)}`
}

export function formatCountdown(total) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export async function fetchRateLimit() {
  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rate-limit`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    })
    if (!res.ok) throw new Error('rate-limit unavailable')
    const data = await res.json()
    return {
      loading: false,
      allowed: data.allowed === false ? false : true,
      seconds: Number(data.retry_after_seconds) || 0,
    }
  } catch {
    return { loading: false, allowed: true, seconds: 0 }
  }
}
