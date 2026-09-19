import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const EASE = [0.22, 1, 0.36, 1]

const STACK = [
  { layer: 'Frontend', tech: 'React + Vite', detail: 'Fast builds, lazy loaded routes' },
  { layer: 'Database', tech: 'Supabase', detail: 'Postgres, real-time, row-level security' },
  { layer: 'Images', tech: 'ImgBB', detail: 'CDN delivery, client-side compression' },
  { layer: 'Hosting', tech: 'Vercel', detail: 'Global CDN, SSL included' },
]

const TAGS = ['Community driven', 'Manually reviewed', 'No accounts needed', 'Always free']

const GUIDELINES = {
  accepted: [
    'A real screenshot of your own setup',
    'Correct window manager and distro',
    'A link to your dotfiles when possible',
  ],
  rejected: [
    'Screenshots taken from someone else without credit',
    'Generic wallpapers with no visible configuration',
    'NSFW or offensive content',
  ],
}

const ROADMAP = [
  'User accounts and saved favorites',
  'Comments on submissions',
  'Public API for browsing rices',
]

function Section({ number, title, children }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: EASE }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 mb-24"
      >
        <div>
          <p className="text-xs font-semibold text-muted mb-2">{number}</p>
          <h2 className="text-5xl font-semibold text-text tracking-tight">{title}</h2>
        </div>
        <div className="flex flex-col gap-6">{children}</div>
      </motion.div>
      <div className="border-t border-border mb-24" />
    </>
  )
}

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-16">
      <Navbar />
      <SEO
        title="About"
        description="Learn about RiceHub, a community-maintained gallery for Linux desktop configurations. Discover the tech stack, submission guidelines, and how to share your own rice."
        url="/about"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About' },
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-24"
      >
        <h1 className="text-8xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[0.95] text-text">
          About <br /> <span className="text-accent">RiceHub</span>
        </h1>
      </motion.div>

      <Section number="01" title="What is this">
        <p className="text-lg text-text leading-relaxed">
          RiceHub is a community-maintained gallery for Linux desktop configurations, what the ricing community calls "rices." Every setup here has been submitted by a real person and manually reviewed before going live.
        </p>
        <p className="text-base text-text-dim leading-relaxed">
          Each entry comes with a screenshot, the window manager and distro it runs on, a color palette, and usually a direct link to the dotfiles on GitHub. You can browse, filter, vote, and get inspired, or submit your own setup and share it with the community.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {TAGS.map((tag) => (
            <span key={tag} className="px-6 py-4.5 rounded-full bg-surface-2 text-[12.5px] font-medium text-text-dim">
              {tag}
            </span>
          ))}
        </div>
      </Section>

      <Section number="02" title="How it's built">
        <p className="text-base text-text-dim leading-relaxed mb-6">
          The entire stack is serverless. No backend to maintain, no servers to scale. Submissions go straight to Supabase, images are compressed and hosted on ImgBB, and the whole thing runs on Vercel.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STACK.map(({ layer, tech, detail }) => (
            <div
              key={layer}
              className="flex flex-col gap-2 p-6 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors duration-200"
            >
              <span className="text-sm font-medium text-muted uppercase tracking-wide">{layer}</span>
              <p className="text-base font-semibold text-text">{tech}</p>
              <p className="text-sm text-text-dim">{detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="03" title="Submission guidelines">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-text mb-3">Accepted</p>
            <ul className="flex flex-col gap-2">
              {GUIDELINES.accepted.map((item) => (
                <li key={item} className="text-base text-text-dim leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-text mb-3">Rejected</p>
            <ul className="flex flex-col gap-2">
              {GUIDELINES.rejected.map((item) => (
                <li key={item} className="text-base text-text-dim leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section number="04" title="How does it help">
        <p className="text-lg text-text leading-relaxed">
          Here you can find various dotfiles created by the community. Everyone has their own ricing style. Find inspiration, or go further and modify a setup to your liking. No more asking someone else for their configuration; upload your own right here and share it with the world. Easy to upload, easy to view, no cookies, no registration, nothing.
        </p>
      </Section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <section>
          <p className="text-xs font-semibold text-muted mb-2">05</p>
          <h2 className="text-5xl font-semibold text-text tracking-tight mb-6">What's next</h2>
          <ul className="flex flex-col gap-2">
            {ROADMAP.map((item) => (
              <li key={item} className="text-base text-text-dim leading-relaxed">{item}</li>
            ))}
          </ul>
        </section>
      </motion.div>
      <Footer />
    </div>
  )
}
