import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faEye,
  faCopy,
  faCheck,
  faThumbsUp,
  faThumbsDown,
  faShareAlt,
  faExpand,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'

const EASE = [0.16, 1, 0.3, 1]
const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vote`
function IconButton({ icon, label, active, tone = 'default', onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-colors duration-200 cursor-pointer',
        active && tone === 'accent' && 'bg-accent text-surface',
        active && tone === 'negative' && 'bg-surface-3 text-red-300',
        !active && 'bg-surface-2 text-text-dim hover:text-text'
      )}
    >
      <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 text-text-dim hover:text-text transition-colors duration-200 text-xs cursor-pointer"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="w-3 h-3" />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-surface/95 flex items-center justify-center p-6"
    >
      <motion.img
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-2xl"
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-2 text-text-dim hover:text-text transition-colors duration-200 cursor-pointer"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </motion.div>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="px-5 py-3.5">
      <p className="text-[11px] text-muted mb-1">{label}</p>
      <p className="text-[13.5px] text-text">{value}</p>
    </div>
  )
}

export default function RiceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [rice, setRice] = useState(null)
  const [riceId, setRiceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [vote, setVote] = useState(null)
  const [voting, setVoting] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    async function fetchRice() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('rices').select('*').eq('slug', slug).single()
        if (error || !data) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setRice(data)
        setRiceId(data.id)


        const voteRes = await fetch(`${FUNCTIONS_URL}?rice_id=${data.id}`)
        const voteData = await voteRes.json()
        if (voteData.vote) setVote(voteData.vote)

      } catch {
        setNotFound(true)
      }
      setLoading(false)
    }

    fetchRice()
  }, [slug])

async function handleVote(type) {
    if (voting || !riceId) return
    setVoting(true)

    try {
      const res = await fetch(FUNCTIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rice_id: riceId, vote_type: type }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setVote(data.vote)
      setRice((p) => (p ? { ...p, likes: data.likes, dislikes: data.dislikes } : null))
    } catch {
      toast.error('Failed to vote')
    }
    setVoting(false)
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: rice.title, text: rice.title, url })
      } catch { }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-7xl font-black text-muted/20">404</h1>
        <p className="text-text-dim">This setup does not exist.</p>
        <button onClick={() => navigate('/')} className="text-accent text-sm cursor-pointer">
          Back to gallery
        </button>
      </div>
    )
  }

  const createdDate = rice.created_at ? new Date(rice.created_at) : null
  const likes = rice.likes ?? 0
  const dislikes = rice.dislikes ?? 0
  const total = likes + dislikes
  const likePercent = total > 0 ? Math.round((likes / total) * 100) : 0

  const details = [
    ['WM / DE', rice.wm],
    ['Distro', rice.distro],
    ['License', rice.license],
    ['Published', createdDate ? format(createdDate, 'MMM d, yyyy') : null],
  ]

  return (
    <>
      <AnimatePresence>
        {lightbox && (
          <Lightbox src={rice.image_url} alt={rice.title} onClose={() => setLightbox(false)} />
        )}
      </AnimatePresence>

      <SEO
        title={rice.title}
        description={rice.description || `${rice.title} — a Linux desktop configuration by ${rice.author || 'anonymous'} using ${rice.wm || 'unknown'} on ${rice.distro || 'unknown'}. Browse the screenshot, color palette, and dotfiles.`}
        url={`/rice/${rice.slug}`}
        image={rice.image_url}
        type="article"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Gallery', url: '/gallery' },
          { name: rice.title },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: rice.title,
          description: rice.description || `${rice.title} — Linux desktop configuration`,
          author: {
            '@type': 'Person',
            name: rice.author || 'anonymous',
          },
          image: rice.image_url,
          url: `https://awesomedotfiles.vercel.app/rice/${rice.slug}`,
          datePublished: rice.created_at,
          publisher: {
            '@type': 'Organization',
            name: 'Awesome Dotfiles',
            logo: {
              '@type': 'ImageObject',
              url: 'https://awesomedotfiles.vercel.app/favicon.png',
            },
          },
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
          className="flex items-center gap-2 text-[13px] text-text-dim hover:text-text transition-colors duration-200 mb-10 cursor-pointer"
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
            <img
              src={rice.image_url}
              alt={rice.title}
              className="w-full max-h-[640px] object-cover"
            />
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
              <div className="flex flex-wrap gap-2 mb-5">
                {rice.wm && (
                  <span className="px-3 py-1 rounded-full bg-surface-3 text-accent text-[11px] font-semibold">
                    {rice.wm}
                  </span>
                )}
                {rice.distro && (
                  <span className="px-3 py-1 rounded-full bg-surface-2 text-text-dim text-[11px] font-medium">
                    {rice.distro}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-text mb-6">
                {rice.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-text-dim mb-7">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-accent font-semibold text-[10px]">
                    {rice.author?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {rice.author ?? 'anonymous'}
                </div>
                {createdDate && <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>}
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                  {rice.views ?? 0}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <IconButton icon={faShareAlt} label="Share" onClick={handleShare} />
                <IconButton
                  icon={faThumbsUp}
                  label={String(likes)}
                  active={vote === 'up'}
                  tone="accent"
                  onClick={() => handleVote('up')}
                />
                <IconButton
                  icon={faThumbsDown}
                  label={String(dislikes)}
                  active={vote === 'down'}
                  tone="negative"
                  onClick={() => handleVote('down')}
                />

                {total > 0 && (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-surface-2">
                    <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${likePercent}%` }} />
                    </div>
                    <span className="text-[11px] text-muted">{likePercent}%</span>
                  </div>
                )}
              </div>
            </div>

            {rice.description && (
              <p className="text-[15px] text-text-dim leading-relaxed max-w-2xl mb-10">
                {rice.description}
              </p>
            )}

            {rice.notes && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-muted">Notes</span>
                  <CopyButton text={rice.notes} />
                </div>
                <div className="rounded-xl bg-surface-2 overflow-hidden">
                  <pre className="p-5 text-[13px] text-text-dim overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                    {rice.notes}
                  </pre>
                </div>
              </section>
            )}
          </main>

          <aside className="flex flex-col gap-4">
            <div className="rounded-xl bg-surface-2 divide-y divide-border overflow-hidden">
              <div className="px-5 py-3.5 text-[11px] text-muted">Details</div>
              {details.map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}
            </div>

            {rice.palette?.length > 0 && (
              <div className="rounded-xl bg-surface-2 p-5">
                <div className="text-[11px] text-muted mb-3.5">Palette</div>
                <div className="flex flex-wrap gap-2.5">
                  {rice.palette.map((color, i) => (
                    <button
                      key={i}
                      title={color}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        navigator.clipboard.writeText(color)
                        toast.success(color)
                      }}
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
                className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-accent text-surface text-[13.5px] font-semibold hover:bg-accent-dim transition-colors duration-200 cursor-pointer"
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
