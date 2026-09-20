export default function Panel({ title, action, children }) {
  return (
    <div className="rounded-lg  bg-surface-2 border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}
