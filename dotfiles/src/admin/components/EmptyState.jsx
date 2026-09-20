import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function EmptyState({ icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <div className="w-14 h-14 rounded-lg bg-surface-3 border border-border flex items-center justify-center">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 text-accent" />
      </div>
      <p className="text-[14px] font-medium text-text">{title}</p>
      <p className="text-[12.5px] text-muted">{hint}</p>
    </div>
  )
}
