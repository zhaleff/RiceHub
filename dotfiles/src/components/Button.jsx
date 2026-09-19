// src/components/Button.jsx
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const VARIANTS = {
  primary: 'bg-accent hover:bg-accent-dim text-surface font-semibold hover:bg-surface-dim focus:scale-95 px-8 py-4 text-[14px]',
  secondary: 'bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text font-medium focus:scale-95 hover:bg-surface-dim px-8 py-4 text-[14px]',
  ghost: 'text-text-dim hover:text-accent hover:text-accent focus:scale-95 text-lg',
}

export default function Button({ to, variant = 'primary', icon, children }) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-2 rounded-full transition-transform duration-400 transition-colors ${VARIANTS[variant]}`}
    >
      {children}
      {icon && (
        <FontAwesomeIcon icon={icon} className="w-3 h-3" />
      )}
    </Link>
  )
}
