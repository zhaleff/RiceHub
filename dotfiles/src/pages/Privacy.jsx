import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const EASE = [0.22, 1, 0.36, 1]
const CONTACT_EMAIL = 'zhaleff.contact@gmail.com'

const SERVICES = [
  { name: 'Supabase', detail: 'Stores rice submissions and votes' },
  { name: 'ImgBB', detail: 'Hosts submitted screenshots' },
  { name: 'Cloudflare Turnstile', detail: 'Verifies submissions are not automated' },
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

export default function Privacy() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        <SEO
          title="Privacy Policy"
          description="How RiceHub collects, uses, and protects data submitted to the community."
          url="/privacy"
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: 'Privacy Policy' },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-24"
        >
          <h1 className="text-7xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[0.95] text-text">
            Privacy <br /> <span className="text-accent">Policy</span>
          </h1>
        </motion.div>

        <Section number="01" title="What we collect">
          <p className="text-lg text-text leading-relaxed">
            When you submit a rice, we store the information you provide: title, description, screenshot,
            window manager, distro, license, and an optional link to your dotfiles. Submissions do not
            require an account or a real name.
          </p>
          <p className="text-base text-text-dim leading-relaxed">
            To prevent spam, we record a one-way cryptographic hash of your IP address at the time of
            submission. This hash cannot be reversed back into your original IP address, and it is only
            used to enforce a submission rate limit.
          </p>
        </Section>

        <Section number="02" title="How we use it">
          <p className="text-lg text-text leading-relaxed">
            Submitted content is reviewed manually before it appears publicly. Approved rices are shown
            to every visitor. We do not sell data, run ads, or share submissions with advertisers.
          </p>
        </Section>

        <Section number="03" title="Third-party services">
          <p className="text-base text-text-dim leading-relaxed mb-2">
            RiceHub relies on a small number of external services to operate:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SERVICES.map(({ name, detail }) => (
              <div key={name} className="flex flex-col gap-2 p-6 rounded-xl bg-surface-2">
                <p className="text-base font-semibold text-text">{name}</p>
                <p className="text-sm text-text-dim">{detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section number="04" title="Cookies">
          <p className="text-lg text-text leading-relaxed">
            RiceHub does not use tracking or advertising cookies. No account system means there is nothing
            to log in to or track across visits.
          </p>
        </Section>

        <Section number="05" title="Data removal">
          <p className="text-lg text-text leading-relaxed">
            You can request removal of a submission you made, including its screenshot and any associated
            metadata, at any time — no account or proof of ownership beyond a reasonable description of the
            submission is required. Removal requests are typically processed within a few days.
          </p>
        </Section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <section>
            <p className="text-xs font-semibold text-muted mb-2">06</p>
            <h2 className="text-5xl font-semibold text-text tracking-tight mb-6">Contact</h2>
            <p className="text-lg text-text leading-relaxed">
              For a removal request or any privacy question, email{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-accent hover:text-accent-dim transition-colors duration-200"
              >
                {CONTACT_EMAIL}
              </a>.
            </p>
          </section>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}
