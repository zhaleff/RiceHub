import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { EASE } from './tokens'

export default function StatCard({ icon, label, value, hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="rounded-lg bg-surface-2 border border-border p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-sm uppercase tracking-sm text-accent">
          <FontAwesomeIcon icon={icon} className="w-3 h-3" />
          {label}
        </div>
      </div>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-text tabular-nums">{value}</p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </motion.div>
  )
}
