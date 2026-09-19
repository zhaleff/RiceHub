import { motion } from 'framer-motion'
import RiceGrid from '../components/RiceGrid'
import SEO from '../components/SEO'

export default function Gallery() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title="Dotfiles Gallery"
        description="Browse every approved Linux desktop setup from the community. Filter by window manager, distro, or sort by popularity. Find your next rice inspiration."
        url="/gallery"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Gallery' },
        ]}
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pt-36 pb-16"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <h1 className="text-8xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[0.95] text-text">
            Dotfiles <span className="text-accent">Gallery</span>
          </h1>
          <p className="text-xl text-text-dim max-w-xs leading-relaxed lg:mb-2">
            Every approved setup from the community — filter by WM, distro, or sort however you want.
          </p>
        </div>
      </motion.section>

      <section className="pb-32">
        <RiceGrid defaultSort="recent" />
      </section>
    </div>
  )
}
