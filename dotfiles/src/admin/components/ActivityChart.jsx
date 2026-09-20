import { useMemo } from 'react'
import { format, subDays, isSameDay } from 'date-fns'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { EASE, CHART_DAYS } from './tokens'

export default function ActivityChart({ rices }) {
  const days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: CHART_DAYS }, (_, i) => {
      const date = subDays(today, CHART_DAYS - 1 - i)
      const count = rices.filter((r) => r.created_at && isSameDay(new Date(r.created_at), date)).length
      return { date, count }
    })
  }, [rices])

  const peak = Math.max(1, ...days.map((d) => d.count))
  const total = days.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="rounded-lg bg-surface-2 border border-border p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm uppercase  text-accent">Submissions per day</p>
        <p className="text-[12px] text-text-dim tabular-nums">{total} in the last {CHART_DAYS} days</p>
      </div>

      <div className="mt-8 flex items-end gap-2 h-44">
        {days.map(({ date, count }) => (
          <div key={date.toISOString()} className="group flex-1 flex flex-col items-center gap-3 h-full justify-end">
            <span className="text-sm text-text-dim opacity-0 group-hover:opacity-100 transition-opacity duration-200 tabular-nums">
              {count}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (count / peak) * 100)}%` }}
              transition={{ duration: 0.6, ease: EASE }}
              className={clsx(
                'w-full rounded-lg transition-colors duration-200',
                count > 0 ? 'bg-accent group-hover:bg-accent' : 'bg-surface-3/40'
              )}
            />
            <span className="text-sm text-muted tabular-nums">{format(date, 'd/M')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
