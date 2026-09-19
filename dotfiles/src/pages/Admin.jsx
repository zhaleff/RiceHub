import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faArrowRightFromBracket, faSpinner, faEye } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import SEO from '../components/SEO'

const EASE = [0.16, 1, 0.3, 1]

function Tag({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-surface-3 text-[11px] font-medium text-text-dim">
      {children}
    </span>
  )
}

function RiceReviewCard({ rice, isActing, onApprove, onReject }) {
  const createdDate = rice.created_at ? new Date(rice.created_at) : null

  return (
    <div className="rounded-2xl bg-surface-2 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <div className="aspect-video md:aspect-auto bg-surface-3 relative">
          {rice.thumbnail_url || rice.image_url ? (
            <img src={rice.thumbnail_url || rice.image_url} alt={rice.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[11px] text-muted">No image</span>
            </div>
          )}
          <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/85 text-[10.5px] font-medium text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Pending review
          </span>
        </div>

        <div className="p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-text leading-snug">{rice.title}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="w-5.5 h-5.5 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-semibold text-accent">
                  {rice.author?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-[13px] text-text-dim">{rice.author || 'anonymous'}</span>
                {createdDate && (
                  <span className="text-[12px] text-muted">
                    · {formatDistanceToNow(createdDate, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {rice.wm && <Tag>{rice.wm}</Tag>}
              {rice.distro && <Tag>{rice.distro}</Tag>}
            </div>

            {rice.description && (
              <p className="text-[13px] text-text-dim leading-relaxed line-clamp-2">{rice.description}</p>
            )}

            {rice.palette?.length > 0 && (
              <div className="flex items-center -space-x-1">
                {rice.palette.slice(0, 10).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full ring-2 ring-surface-2"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              {rice.github_url && (
                <a
                  href={rice.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-text-dim hover:text-text transition-colors duration-200 truncate cursor-pointer"
                >
                  <FontAwesomeIcon icon={faGithub} className="w-3 h-3 flex-shrink-0" />
                  {rice.github_url.replace('https://github.com/', '')}
                </a>
              )}
              {rice.slug && (
                <a
                  href={`/rice/${rice.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-text-dim hover:text-text transition-colors duration-200 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                  Preview
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <button
              onClick={onApprove}
              disabled={isActing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-surface hover:bg-accent-dim text-[12.5px] font-semibold transition-colors duration-200 disabled:opacity-40 cursor-pointer"
            >
              <FontAwesomeIcon icon={isActing ? faSpinner : faCheck} className={clsx('w-3 h-3', isActing && 'animate-spin')} />
              Approve
            </button>
            <button
              onClick={onReject}
              disabled={isActing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-3 text-red-300 hover:bg-surface text-[12.5px] font-semibold transition-colors duration-200 disabled:opacity-40 cursor-pointer"
            >
              <FontAwesomeIcon icon={isActing ? faSpinner : faXmark} className={clsx('w-3 h-3', isActing && 'animate-spin')} />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const { user, initialized } = useAuth()
  const navigate = useNavigate()
  const [rices, setRices] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  useEffect(() => {
    if (initialized && user === null) navigate('/admin/login')
  }, [user, initialized, navigate])

  useEffect(() => {
    if (user) fetchPending()
  }, [user])

  async function fetchPending() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rices')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRices(data)
    } catch {
      toast.error('Failed to load pending submissions.')
    } finally {
      setLoading(false)
    }
  }

  async function approve(id) {
    setActing(id)
    try {
      const { error } = await supabase.from('rices').update({ status: 'approved' }).eq('id', id)
      if (error) throw error
      setRices((prev) => prev.filter((r) => r.id !== id))
      toast.success('Approved!')
    } catch {
      toast.error('Failed to approve.')
    } finally {
      setActing(null)
    }
  }

  async function reject(id) {
    setActing(id)
    try {
      const { error } = await supabase.from('rices').delete().eq('id', id)
      if (error) throw error
      setRices((prev) => prev.filter((r) => r.id !== id))
      toast.success('Rejected and deleted.')
    } catch {
      toast.error('Failed to reject.')
    } finally {
      setActing(null)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-24">
      <SEO
        title="Admin Panel"
        description="Admin moderation panel for Awesome Dotfiles. Review and manage community submissions."
        url="/admin"
        type="website"
      />
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-text tracking-tight">Pending submissions</h1>
          <p className="text-[13px] text-text-dim mt-1">
            {loading ? 'Loading…' : `${rices.length} waiting for review`}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 hover:bg-surface-3 text-[12.5px] font-medium text-text-dim hover:text-text transition-colors duration-200 cursor-pointer"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3 h-3" />
          Sign out
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface-2 h-40 animate-pulse" />
          ))}
        </div>
      ) : rices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
            <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-accent" />
          </div>
          <p className="text-[14px] font-medium text-text">All clear</p>
          <p className="text-[12.5px] text-muted">No pending submissions</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {rices.map((rice, i) => (
              <motion.div
                key={rice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12, scale: 0.98 }}
                transition={{ duration: 0.3, delay: i * 0.03, ease: EASE }}
              >
                <RiceReviewCard
                  rice={rice}
                  isActing={acting === rice.id}
                  onApprove={() => approve(rice.id)}
                  onReject={() => reject(rice.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
