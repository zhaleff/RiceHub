import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { EASE, CONTACT_EMAIL, LAST_UPDATED, LEGAL_LINKS } from './constants'

export function LegalSection({ number, title, children }) {
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
          <h2 className="text-4xl sm:text-5xl font-semibold text-text tracking-tight">{title}</h2>
        </div>
        <div className="flex flex-col gap-6">{children}</div>
      </motion.div>
      <div className="border-t border-border mb-24" />
    </>
  )
}

export function LegalContact({ title = 'Contact' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <section>
        <h2 className="text-5xl font-semibold text-text tracking-tight mb-6">{title}</h2>
        <p className="text-lg text-text leading-relaxed">
          For any question about this policy, email{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent hover:text-accent-dim transition-colors duration-200"
          >
            {CONTACT_EMAIL}
          </a>.
        </p>
      </section>
    </motion.div>
  )
}

export function LegalNav({ current }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-24">
      {LEGAL_LINKS.map(({ label, to }) => (
        <Link
          key={to}
          to={to}
          aria-current={to === current ? 'page' : undefined}
          className={
            to === current
              ? 'text-base font-medium text-text'
              : 'text-base text-text-dim hover:text-text transition-colors duration-200'
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

export default function LegalLayout({
  title,
  accent,
  description,
  url,
  seoTitle,
  lastUpdated = LAST_UPDATED,
  children,
}) {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        <SEO
          title={seoTitle || title}
          description={description}
          url={url}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: seoTitle || title },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10"
        >
          <h1 className="text-7xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[0.95] text-text">
            {title} <br /> <span className="text-accent">{accent}</span>
          </h1>
          <p className="mt-8 text-sm text-muted">Last updated: {lastUpdated}</p>
        </motion.div>

        <LegalNav current={url} />

        {children}
      </div>
      <Footer />
    </>
  )
}
