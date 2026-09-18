import { useEffect, useState } from 'react'

const RATE_LIMIT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rate-limit`

export function useRateLimit() {
  const [rateLimit, setRateLimit] = useState({ loading: true, allowed: true, retryAfter: 0 })

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(RATE_LIMIT_URL)
        const data = await res.json()
        setRateLimit({ loading: false, allowed: data.allowed, retryAfter: data.retry_after_seconds })
      } catch {
        setRateLimit({ loading: false, allowed: true, retryAfter: 0 })
      }
    })()
  }, [])

  return rateLimit
}