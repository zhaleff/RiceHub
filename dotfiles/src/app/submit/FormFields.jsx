import clsx from 'clsx'

export const BTN_PRIMARY_FULL = 'flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200'
export const BTN_PRIMARY = 'flex items-center justify-center gap-2 flex-1 py-3.5 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200'
export const BTN_PRIMARY_DISABLED = 'flex items-center justify-center gap-2 flex-1 py-3.5 rounded-full bg-accent hover:bg-accent-dim disabled:opacity-40 text-surface text-sm cursor-pointer transition-colors duration-200'
export const BTN_BACK = 'flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-sm cursor-pointer transition-colors duration-200'

export function FieldHint({ children }) {
  return <p className="text-xs text-muted mb-2">{children}</p>
}

export function FieldError({ message }) {
  return <p className="text-xs text-red-300 mt-1.5">{message}</p>
}

export function Field({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-4 py-3.5 rounded-2xl bg-surface-2 text-sm text-text placeholder:text-muted outline-none transition-colors duration-200',
        error ? 'ring-1 ring-red-400/40' : 'focus:bg-surface-3',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={clsx(
        'w-full px-4 py-3.5 rounded-2xl bg-surface-2 text-sm text-text placeholder:text-muted outline-none resize-none transition-colors duration-200 focus:bg-surface-3',
        className
      )}
      {...props}
    />
  )
}

export function Chips({ options, value, onChange, error }) {
  return (
    <div className={clsx('flex flex-wrap gap-1.5', error && 'ring-1 ring-red-400/40 rounded-xl p-2')}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === value ? '' : opt)}
          className={clsx(
            'px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition-colors duration-200',
            value === opt
              ? 'bg-accent text-surface'
              : 'bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}