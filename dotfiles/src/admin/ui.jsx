import { useMemo } from 'react'
import { formatDistanceToNow, format, subDays, isSameDay } from 'date-fns'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faThumbsUp, faEye, faCheck, faXmark, faSpinner, faRotate } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import clsx from 'clsx'

const EASE = [0.16, 1, 0.3, 1]
const CHART_DAYS = 14

export const BTN_BASE = 'inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-medium transition-colors duration-200 cursor-pointer disabled:opacity-40'
export const BTN_SOLID = `${BTN_BASE} bg-accent text-surface hover:bg-accent-dim`
export const BTN_GHOST = `${BTN_BASE} bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text`

export function StatCard({ icon, label, value, hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="rounded-2xl bg-transparent border border-border p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.18em] text-muted">
          <FontAwesomeIcon icon={icon} className="w-3 h-3" />
          {label}
        </div>
        <FontAwesomeIcon icon={faEllipsis} className="w-3 h-3 text-muted" />
      </div>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-text tabular-nums">{value}</p>
      <p className="mt-2 text-[12px] text-muted">{hint}</p>
    </motion.div>
  )
}

export function ActivityChart({ rices }) {
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
    <div className="rounded-2xl bg-transparent border border-border p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Submissions per day</p>
        <p className="text-[12px] text-text-dim tabular-nums">{total} in the last {CHART_DAYS} days</p>
      </div>

      <div className="mt-8 flex items-end gap-2 h-44">
        {days.map(({ date, count }) => (
          <div key={date.toISOString()} className="group flex-1 flex flex-col items-center gap-3 h-full justify-end">
            <span className="text-[11px] text-text-dim opacity-0 group-hover:opacity-100 transition-opacity duration-200 tabular-nums">
              {count}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (count / peak) * 100)}%` }}
              transition={{ duration: 0.6, ease: EASE }}
              className={clsx(
                'w-full rounded-lg transition-colors duration-200',
                count > 0 ? 'bg-surface-3 group-hover:bg-accent' : 'bg-surface-3/40'
              )}
            />
            <span className="text-[10px] text-muted tabular-nums">{format(date, 'd/M')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RecentRow({ rice }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-surface-3/40 transition-colors duration-200">
      <div className="w-16 h-11 rounded-lg overflow-hidden bg-surface-3 flex-shrink-0">
        {(rice.thumbnail_url || rice.image_url) && (
          <img src={rice.thumbnail_url || rice.image_url} alt={rice.title} loading="lazy" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] text-text truncate">{rice.title}</p>
        <p className="text-[12px] text-muted truncate">
          {rice.author || 'anonymous'}
          {rice.wm && ` · ${rice.wm}`}
          {rice.created_at && ` · ${formatDistanceToNow(new Date(rice.created_at), { addSuffix: true })}`}
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-[12px] text-text-dim tabular-nums flex-shrink-0">
        <FontAwesomeIcon icon={faThumbsUp} className="w-3 h-3" />
        {rice.likes ?? 0}
      </div>
    </div>
  )
}

export function Panel({ title, action, children }) {
  return (
    <div className="rounded-2xl bg-transparent border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

export function EmptyState({ icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border flex items-center justify-center">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 text-accent" />
      </div>
      <p className="text-[14px] font-medium text-text">{title}</p>
      <p className="text-[12.5px] text-muted">{hint}</p>
    </div>
  )
}

export function Tag({ children }) {
  return <span className="px-3 py-1.5 rounded-lg bg-surface-3 text-[11px] font-medium text-text-dim">{children}</span>
}

export function ReviewCard({ rice, acting, onApprove, onReject }) {
  return (
    <div className="rounded-2xl bg-transparent border border-border overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <div className="aspect-video md:aspect-auto bg-surface-3 relative">
          {rice.thumbnail_url || rice.image_url ? (
            <img src={rice.thumbnail_url || rice.image_url} alt={rice.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[11px] text-muted">No image</span>
            </div>
          )}
          <span className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/85 text-[10.5px] font-medium text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Pending review
          </span>
        </div>

        <div className="p-6 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-text leading-snug">{rice.title}</h2>
              <p className="mt-2 text-[13px] text-text-dim">
                {rice.author || 'anonymous'}
                {rice.created_at && ` · ${formatDistanceToNow(new Date(rice.created_at), { addSuffix: true })}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {rice.wm && <Tag>{rice.wm}</Tag>}
              {rice.distro && <Tag>{rice.distro}</Tag>}
            </div>

            {rice.description && (
              <p className="text-[13px] text-text-dim leading-relaxed line-clamp-2">{rice.description}</p>
            )}

            {rice.palette?.length > 0 && (
              <div className="flex items-center -space-x-1">
                {rice.palette.slice(0, 10).map((color) => (
                  <div key={color} className="w-5 h-5 rounded-full ring-2 ring-surface-2" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-5">
              {rice.github_url && (
                <a
                  href={rice.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] text-text-dim hover:text-text transition-colors duration-200 truncate"
                >
                  <FontAwesomeIcon icon={faGithub} className="w-3 h-3 flex-shrink-0" />
                  {rice.github_url.replace('https://github.com/', '')}
                </a>
              )}
              {rice.slug && (
                <a
                  href={`/rice/${rice.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] text-text-dim hover:text-text transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                  Preview
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-5 border-t border-border">
            <button onClick={onApprove} disabled={acting} className={BTN_SOLID}>
              <FontAwesomeIcon icon={acting ? faSpinner : faCheck} className={clsx('w-3.5 h-3.5', acting && 'animate-spin')} />
              Approve
            </button>
            <button
              onClick={onReject}
              disabled={acting}
              className={clsx(BTN_BASE, 'bg-surface-3 text-red-300 hover:bg-surface')}
            >
              <FontAwesomeIcon icon={acting ? faSpinner : faXmark} className={clsx('w-3.5 h-3.5', acting && 'animate-spin')} />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageHeader({ heading, loading, onRefresh }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-5 mb-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text">{heading}</h1>
      </div>
      <button onClick={onRefresh} disabled={loading} className={BTN_GHOST}>
        <FontAwesomeIcon icon={faRotate} className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
        Refresh
      </button>
    </div>
  )
}