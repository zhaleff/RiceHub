import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { STEPS } from './constants'

export default function ProgressBar({ step }) {
  const pct = (step / (STEPS.length - 1)) * 100
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors duration-200',
              i === step ? 'bg-accent text-surface' : i < step ? 'bg-surface-3 text-text-dim' : 'bg-surface-2 text-muted'
            )}
          >
            {i < step ? (
              <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
            ) : (
              <span className="text-[10px] font-medium">{i + 1}</span>
            )}
            <span className="text-[11px] hidden sm:block">{label}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}