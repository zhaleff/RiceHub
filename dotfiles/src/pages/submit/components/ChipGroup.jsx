import clsx from 'clsx'
import FieldError from './FieldError'

export default function ChipGroup({ field, value, error, onChange }) {
  return (
    <div>
      <p className="text-xs text-muted mb-2">{field.label}</p>
      <div className={clsx('flex flex-wrap gap-1.5', error && 'ring-1 ring-red-400/40 rounded-xl p-2')}>
        {field.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === value ? '' : opt)}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition-colors duration-200',
              value === opt ? 'bg-accent text-surface' : 'bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      <FieldError message={error?.message} />
    </div>
  )
}
