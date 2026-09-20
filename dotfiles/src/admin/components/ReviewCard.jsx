import { formatDistanceToNow } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faCheck, faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import clsx from 'clsx'
import { BTN_BASE, BTN_SOLID } from './buttonStyles'
import Tag from './Tag'

export default function ReviewCard({ rice, acting, onApprove, onReject }) {
  return (
    <div className="rounded-lg bg-surface-2 border border-border overflow-hidden">
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
