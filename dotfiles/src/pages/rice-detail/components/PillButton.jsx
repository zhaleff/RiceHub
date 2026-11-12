import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'

export default function PillButton({ icon, label, active, small, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 rounded-full transition-colors duration-200 cursor-pointer',
        small ? 'px-4 h-9 text-xs' : 'px-7 h-14 text-sm font-medium',
        active ? 'bg-accent text-surface' : 'bg-surface-2 text-text-dim hover:text-text'
      )}
    >
      <FontAwesomeIcon icon={icon} className={small ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </button>
  )
}
