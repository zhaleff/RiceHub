import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faRedditAlien } from '@fortawesome/free-brands-svg-icons'
import logo from '../assets/ricehub.png'

const LINKS = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Submit your rice', to: '/submit' },
]

const SOCIALS = [
  { icon: faGithub, label: 'GitHub', href: 'https://github.com/zhaleff/RiceHub' },
  { icon: faRedditAlien, label: 'r/unixporn', href: 'https://reddit.com/r/unixporn' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="RiceHub" className="h-12 mb-2 w-auto" />
          <span className="text-lg text-muted">
            Built by <span className="text-text-dim font-medium">Zhaleff</span> · © {year}
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="text-lg text-text-dim hover:text-text transition-colors duration-200">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {SOCIALS.map(({ icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-2 text-text-dim hover:text-text hover:bg-surface-3 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={icon} className="w-6 h-6" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
