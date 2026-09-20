import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { supabase } from '../lib/supabase'
import logo from '../assets/ricehub.png'
import SEO from '../components/SEO'

const EASE = [0.16, 1, 0.3, 1]
const SHOWCASE_LIMIT = 6

const INPUT = 'w-full h-16 px-6 bg-surface-2 border-2 border-border rounded-full text-[15px] text-text placeholder:text-muted outline-none transition-colors duration-200 focus:border-accent focus:bg-surface-3'

function useShowcase() {
  const [rices, setRices] = useState([])

  useEffect(() => {
    supabase
      .from('rices')
      .select('id, slug, title, author, wm, thumbnail_url')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(SHOWCASE_LIMIT)
      .then(({ data }) => setRices(data ?? []))
  }, [])

  return rices
}

function Showcase({ rices }) {
  return (
    <div className="relative hidden lg:block border-l-2 border-border overflow-hidden">
      <motion.div
        className="absolute left-0 right-0 top-0 h-[200%]"
        animate={{ y: ['0%', '-50%'] }}
        transition={{ duration: 45, ease: 'linear', repeat: Infinity }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="h-1/2 grid grid-cols-2 grid-rows-3">
            {rices.map((rice, i) => (
              <motion.div
                key={`${copy}-${rice.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="relative border-b-2 border-l-2 border-border overflow-hidden"
              >
                {rice.thumbnail_url && (
                  <img src={rice.thumbnail_url} alt={rice.title} loading="lazy" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[13px] font-semibold text-text truncate">{rice.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const rices = useShowcase()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back.')
      navigate('/admin')
    } catch {
      toast.error('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,560px)_1fr]">
      <SEO title="Admin Login" description="Sign in to the RiceHub admin panel." url="/admin/login" />

      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col justify-between px-8 sm:px-14 py-14"
      >
        <div>
          <img src={logo} alt="RiceHub" className="h-10 w-auto" />
          <h1 className="text-7xl lg:text-7xl sm:text-6xl font-semibold tracking-tighter leading-[0.95] text-text">
            Review<br />the queue.
          </h1>
          <p className="mt-6 mb-6  text-[15px] text-text-dim max-w-sm leading-relaxed">
            Every submission waits here until someone approves it. Sign in to clear the backlog.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              className={clsx(INPUT, errors.email && 'border-red-400/60')}
              {...register('email', { required: true })}
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className={clsx(INPUT, errors.password && 'border-red-400/60')}
              {...register('password', { required: true })}
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full h-16 px-6 bg-accent rounded-full hover:bg-accent-dim disabled:opacity-40 text-surface text-[13px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Iniciando sesión...' : 'Entrar'}</span>
              {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
            </button>
          </form>

      </motion.div>

      <Showcase rices={rices} />
    </div>
  )
}

