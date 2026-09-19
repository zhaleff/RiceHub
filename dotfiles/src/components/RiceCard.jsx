import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

export default function RiceCard({ rice, index = 0 }) {
  const date = rice.created_at ? new Date(rice.created_at) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/rice/${rice.slug}`} className="group block">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-2">
          {rice.thumbnail_url || rice.image_url ? (
            <img
              src={rice.thumbnail_url || rice.image_url}
              alt={rice.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm text-muted">No preview</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {rice.wm && (
            <span className="absolute top-4 left-4 px-4 py-2 rounded-full bg-surface/80 text-xs font-medium text-text-dim">
              {rice.wm}
            </span>
          )}

          {rice.palette?.length > 0 && (
            <div className="absolute bottom-4 right-4 flex -space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {rice.palette.slice(0, 5).map((color, i) => (
                <div key={i} className="w-4 h-4 rounded-full ring-2 ring-surface" style={{ backgroundColor: color }} />
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-medium text-text leading-snug truncate">
              {rice.title}
            </h3>
            <p className="mt-1 text-sm text-muted truncate">
              {rice.author ?? 'anonymous'}
              {date && <span> · {formatDistanceToNow(date, { addSuffix: true })}</span>}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted flex-shrink-0 pt-0.5 transition-colors duration-200 group-hover:text-accent">
            <FontAwesomeIcon icon={faThumbsUp} className="w-3.5 h-3.5" />
            <span>{rice.likes ?? 0}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
