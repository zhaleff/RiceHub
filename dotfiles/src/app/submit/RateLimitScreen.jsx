import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { formatCountdown } from './utils'

export default function RateLimitScreen({ retryAfter }) {
  const [seconds, setSeconds] = useState(retryAfter)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [seconds])

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="flex flex-col items-center text-center gap-4 py-16">
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-text-dim" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text mb-2">One submission per hour</h1>
          <p className="text-sm text-text-dim max-w-sm">
            You've already submitted a rice recently. You can submit again in
          </p>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-accent tabular-nums">
          {seconds > 0 ? formatCountdown(seconds) : 'now'}
        </p>
        {seconds === 0 && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-3 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}