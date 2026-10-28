import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faEye, faCopy, faCheck, faThumbsUp, faShareAlt, faExpand, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'

const EASE = [0.16, 1, 0.3, 1]
const VOTE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vote`
const PANEL = 'rounded-xl bg-surface-2'
                                                                                              

function PillButton({ icon, label, active, small, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 rounded-full transition-colors duration-200 cursor-pointer',
        small ? 'px-4 h-9 text-xs' : 'px-7 h-14 text-sm font-medium',
        active ? 'bg-accent text-surface' : 'bg-surface-2 text-text-dim hover:text-text'
      )}
    >
      <FontAwesomeIcon icon={icon} className={small ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </button>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <PillButton
      small
      icon={copied ? faCheck : faCopy}
      label={copied ? 'Copied' : 'Copy'}
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
    />
  )
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-surface/95 flex items-center justify-center p-6 overflow-auto"
    >
      <motion.img
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded-2xl"
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed top-6 right-6 w-12 h-12 rounded-full bg-surface-2 text-text-dim hover:text-text transition-colors duration-200 cursor-pointer"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </motion.div>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="px-6 py-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm text-text">{value}</p>
    </div>
  )
}

export default function RiceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [rice, setRice] = useState()
  const [loadedSlug, setLoadedSlug] = useState()
  const [voted, setVoted] = useState(false)
  const [voting, setVoting] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const { data, error } = await supabase.from('rices').select('*').eq('slug', slug).single()
        if (error || !data) throw error
        const { vote } = await fetch(`${VOTE_URL}?rice_id=${data.id}`).then((r) => r.json()).catch(() => ({}))
        if (ignore) return
        setRice(data)
        setVoted(vote === 'up')
        setLoadedSlug(slug)
      } catch {
        if (!ignore) {
          setRice(null)
          setLoadedSlug(slug)
        }
      }
    }

    load()
    return () => { ignore = true }
  }, [slug])

  async function handleVote() {
    if (voting) return
    setVoting(true)
    try {
      const res = await fetch(VOTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rice_id: rice.id, vote_type: 'up' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVoted(data.vote === 'up')
      setRice((prev) => ({ ...prev, likes: data.likes }))
    } catch {
      toast.error('Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  async function handleShare() {
    const url = window.location.href
    if (!navigator.share) {
      await navigator.clipboard.writeText(url)
      return toast.success('Link copied')
    }
    try {
      await navigator.share({ title: rice.title, text: rice.title, url })
    } catch (e) {
      if (e.name !== 'AbortError') toast.error('Failed to share')
    }
  }

  if (loadedSlug !== slug || rice === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    )
  }

  if (rice === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-7xl font-black text-muted/20">404</h1>
        <p className="text-text-dim">This setup does not exist.</p>
        <button onClick={() => navigate('/')} className="text-accent text-sm cursor-pointer">
          Back to home
        </button>
      </div>
    )
  }

  const authorName = rice.author || 'anonymous'
  const createdDate = rice.created_at ? new Date(rice.created_at) : null
  const details = [
    ['WM / DE', rice.wm],
    ['Distro', rice.distro],
    ['License', rice.license],
    ['Published', createdDate && format(createdDate, 'MMM d, yyyy')],
  ]

  return (
    <>
      <AnimatePresence>
        {lightbox && <Lightbox src={rice.image_url} alt={rice.title} onClose={() => setLightbox(false)} />}
      </AnimatePresence>

      <SEO
        title={rice.title}
        description={rice.description || `${rice.title} — a Linux desktop configuration by ${authorName} using ${rice.wm || 'unknown'} on ${rice.distro || 'unknown'}.`}
        url={`/rice/${rice.slug}`}
        image={rice.image_url}
        type="article"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Community builds', url: '/' },
          { name: rice.title },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: rice.title,
          description: rice.description || `${rice.title} — Linux desktop configuration`,
          author: { '@type': 'Person', name: authorName },
          image: rice.image_url,
          datePublished: rice.created_at,
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-24"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors duration-200 mb-10 cursor-pointer"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
          Back
        </button>

        {rice.image_url && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="group relative overflow-hidden rounded-2xl bg-surface-2 mb-10 cursor-zoom-in"
            onClick={() => setLightbox(true)}
          >
            <img src={rice.image_url} alt={rice.title} className="w-full max-h-[640px] object-cover" />
            <div className="absolute inset-0 bg-surface/0 group-hover:bg-surface/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-12 h-12 rounded-full bg-surface/80 flex items-center justify-center text-text">
                <FontAwesomeIcon icon={faExpand} className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          <main>
            <div className="pb-8 mb-8 border-b border-border">


              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-text mb-6">
                {rice.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-lg text-text-dim mb-7">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-accent font-semibold text-base">
                    {rice.author?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {authorName}
                </div>
                {createdDate && <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>}
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                  {rice.views ?? 0}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <PillButton icon={faShareAlt} label="Share" onClick={handleShare} />
                <PillButton icon={faThumbsUp} label={String(rice.likes ?? 0)} active={voted} onClick={handleVote} />
              </div>
            </div>

            {rice.description && (
              <p className="text-base text-text-dim leading-relaxed max-w-2xl mb-10">
                {rice.description}
              </p>
            )}

            {rice.notes && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted">Notes</span>
                  <CopyButton text={rice.notes} />
                </div>
                <div className={clsx(PANEL, 'overflow-hidden')}>
                  <pre className="p-5 text-sm text-text-dim overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                    {rice.notes}
                  </pre>
                </div>
              </section>
            )}
          </main>

          <aside className="flex flex-col gap-4">
            <div className={clsx(PANEL, 'divide-y divide-border overflow-hidden')}>
              <div className="px-6 py-4 text-xs text-muted">Details</div>
              {details.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}
            </div>

            {rice.palette?.length > 0 && (
              <div className={clsx(PANEL, 'p-5')}>
                <div className="text-xs text-muted mb-3.5">Palette</div>
                <div className="flex flex-wrap gap-2.5">
                  {rice.palette.map((color, i) => (
                    <button
                      key={i}
                      title={color}
                      style={{ backgroundColor: color }}
                      onClick={() => { navigator.clipboard.writeText(color); toast.success(color) }}
                      className="w-9 h-9 rounded-full ring-1 ring-border hover:scale-110 transition-transform duration-200 cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}

            {rice.github_url && (
              <a
                href={rice.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 px-5 h-12 rounded-xl bg-accent text-surface text-base font-semibold hover:bg-accent-dim transition-colors duration-200 cursor-pointer"
              >
                <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
                View dotfiles
              </a>
            )}
          </aside>
        </div>
      </motion.div>
    </>
  )
}
