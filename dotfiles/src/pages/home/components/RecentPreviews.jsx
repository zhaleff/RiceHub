import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import RiceCard from '../../../components/RiceCard'

export default function RecentPreviews() {
  const [rices, setRices] = useState([])

  useEffect(() => {
    supabase
      .from('rices')
      .select('id, slug, title, author, thumbnail_url, image_url, wm, distro, likes, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setRices(data ?? []))
      .catch(() => {})
  }, [])

  if (!rices.length) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-2xl bg-surface-2 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {rices.map((rice, i) => (
        <RiceCard key={rice.id} rice={rice} index={i} />
      ))}
    </div>
  )
}
