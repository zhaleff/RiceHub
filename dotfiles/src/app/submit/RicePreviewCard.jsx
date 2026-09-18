export default function RicePreviewCard({ title, author, wm, palette, imagePreview }) {
  return (
    <div className="w-full">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-2">
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-muted">No preview</span>
          </div>
        )}
        {wm && (
          <span className="absolute top-3 left-3 px-3 py-2 rounded-full bg-surface/80 text-[11px] font-medium text-text-dim">
            {wm}
          </span>
        )}
        {palette?.length > 0 && (
          <div className="absolute bottom-3 right-3 flex -space-x-1">
            {palette.slice(0, 5).map((color, i) => (
              <div key={i} className="w-4 h-4 rounded-full ring-2 ring-surface" style={{ backgroundColor: color }} />
            ))}
          </div>
        )}
      </div>
      <div className="pt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-medium text-text leading-snug truncate">
            {title || 'Your untitled rice'}
          </h3>
          <p className="mt-1 text-[13px] text-muted truncate">
            {author || 'anonymous'} · just now
          </p>
        </div>
        <div className="flex items-center gap-1 text-[12.5px] text-muted flex-shrink-0 pt-0.5">
          <span>0</span>
        </div>
      </div>
    </div>
  )
}