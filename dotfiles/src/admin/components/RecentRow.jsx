import { formatDistanceToNow } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export default function RecentRow({ rice }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4  hover:bg-surface-3/40 transition-colors duration-200">
      <div className="w-16 h-11 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
        {(rice.thumbnail_url || rice.image_url) && (
          <img src={rice.thumbnail_url || rice.image_url} alt={rice.title} loading="lazy" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base text-text truncate">{rice.title}</p>
        <p className="text-[12px] text-muted truncate">
          {rice.author || 'anonymous'}
          {rice.wm && ` · ${rice.wm}`}
          {rice.created_at && ` · ${formatDistanceToNow(new Date(rice.created_at), { addSuffix: true })}`}
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-[12px] text-dim tabular-nums flex-shrink-0">
        <FontAwesomeIcon icon={faThumbsUp} className="w-3 h-3" />
        {rice.likes ?? 0}
      </div>
    </div>
  )
}
