export default function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="px-6 py-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm text-text">{value}</p>
    </div>
  )
}
