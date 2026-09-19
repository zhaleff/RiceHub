import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'

const EASE = [0.22, 1, 0.36, 1]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <SEO
        title="RiceHub — Linux Dotfiles, Rices & Desktop Configurations Gallery"
        description="Discover and share Linux desktop configurations, color palettes, and dotfiles from the community. Browse rices for Hyprland, i3, Sway, and more."
        url="/"
        type="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'RiceHub',
          url: 'https://ricehub.vercel.app',
          description: 'Community gallery for Linux desktop configurations — dotfiles, rices, and color palettes for Hyprland, i3, Sway, bspwm, dwm, and more.',
        }}
      />
      <section className="pt-36 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end gap-10 mb-10">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.05em] leading-[0.9] text-text">
              Linux dotfiles, <br />
              <span className="text-accent">shared</span>
            </h1>
            <p className="text-base text-text-dim max-w-sm leading-relaxed lg:mb-2">
              The community hub for Linux desktop configurations. Browse rices, color palettes, and dotfiles for Hyprland, i3, Sway, and more.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/gallery"
              className="group flex items-center gap-2 px-6 py-3.5 hover:scale-110 transition-transform duration-400 rounded-full bg-accent hover:bg-accent-dim text-surface text-[14px] font-semibold transition-colors duration-200 cursor-pointer"
            >
              Browse gallery
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 transition-transform duration-400 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/submit"
              className="flex items-center px-6 py-3.5 rounded-full bg-surface-2 hover:scale-110 transition-transform duration-400 hover:bg-surface-3 text-text-dim hover:text-text text-[14px] font-medium transition-colors duration-200 cursor-pointer"
            >
              Submit your rice
            </Link>
            
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="pb-28"
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[15px] font-semibold text-text">Fresh from the community</p>
            <p className="text-[13px] text-muted mt-0.5">New setups, added daily</p>
          </div>
          <Link
            to="/gallery"
            className="group flex items-center gap-1.5 text-[13px] text-text-dim hover:text-accent hover:scale-95 transition-colors duration-200 cursor-pointer flex-shrink-0"
          >
            View all
            <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <RecentPreviews />
      </motion.section>
    </div>
  )
}

function RecentPreviews() {
  const [rices, setRices] = useState([])

  useEffect(() => {
    supabase
      .from('rices')
      .select('id, slug, title, author, thumbnail_url, image_url, wm, distro')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setRices(data ?? []))
      .catch(() => {})
  }, [])

  if (!rices.length) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-2xl bg-surface-2 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {rices.map((rice, i) => (
        <motion.div
          key={rice.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
        >
          <Link to={`/rice/${rice.slug}`} className="group block rounded-2xl overflow-hidden bg-surface-2">
            <div className="aspect-video overflow-hidden relative bg-surface-3">
              {rice.thumbnail_url || rice.image_url ? (
                <img
                  src={rice.thumbnail_url || rice.image_url}
                  alt={rice.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] text-muted">No preview</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {rice.wm && (
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-surface/80 text-[10.5px] font-medium text-text-dim">
                  {rice.wm}
                </span>
              )}
            </div>
            <div className="px-3.5 py-3 flex items-center justify-between">
              <p className="text-[13.5px] font-medium text-text truncate">{rice.title}</p>
              <span className="text-[12px] text-muted flex-shrink-0 ml-2">{rice.author ?? 'anon'}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
