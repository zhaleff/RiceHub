import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabase'

const EASE = [0.16, 1, 0.3, 1]
const SHOWCASE_LIMIT = 6

function useShowcase() {
  const [rices, setRices] = useState([])

  useEffect(() => {
    supabase
      .from('rices')
      .select('id, slug, title, author, wm, thumbnail_url')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(SHOWCASE_LIMIT)
      .then(({ data }) => setRices(data ?? []))
  }, [])

  return rices
}

export default function Showcase() {
  const rices = useShowcase()

  return (
    <div className="relative hidden lg:block border-l-2 border-border overflow-hidden">
      <motion.div
        className="absolute left-0 right-0 top-0 h-[200%]"
        animate={{ y: ['0%', '-50%'] }}
        transition={{ duration: 45, ease: 'linear', repeat: Infinity }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="h-1/2 grid grid-cols-2 grid-rows-3">
            {rices.map((rice, i) => (
              <motion.div
                key={`${copy}-${rice.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="relative border-b-2 border-l-2 border-border overflow-hidden"
              >
                {rice.thumbnail_url && (
                  <img src={rice.thumbnail_url} alt={rice.title} loading="lazy" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[13px] font-semibold text-text truncate">{rice.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
