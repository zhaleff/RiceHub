import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import Button from "../components/Button"
import RiceCard from '../components/RiceCard'

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
          url: 'https://ricehubx.vercel.app',
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
            <h1 className="text-8xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.05em] leading-[0.9] text-text">
              Linux dotfiles <br />
              <span className="text-accent">shared</span>
            </h1>
            <p className="text-base text-text-dim max-w-sm leading-relaxed  lg:mb-2 lg:ml-12 ">
              The community hub for Linux desktop configurations. Browse rices, color palettes, and dotfiles for Hyprland, i3, Sway, and more.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button to="/gallery" icon={faArrowRight}>Browse gallery</Button>
             <Button to="/submit" variant="secondary">Submit your rice</Button>
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
            <p className="text-xl font-semibold text-text">Fresh from the community</p>
            <p className="text-base text-muted mt-0.5">New setups, added daily</p>
          </div>
          <Button to="/gallery" variant="ghost" icon={faArrowRight}>View all</Button>
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
