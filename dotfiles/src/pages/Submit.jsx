import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faXmark, faCloudArrowUp, faArrowLeft, faArrowRight, faCheck, faClock } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import clsx from 'clsx'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/imgbb'
import { makeThumbnail, makeFullImage } from '../lib/imageresized'
import SEO from '../components/SEO'

const STEPS = ['Screenshot', 'Details', 'Config', 'Review']

const STEP_HINTS = [
  'Start with the visuals — upload a screenshot of your desktop.',
  "Tell us what this is. It's the first thing people will see.",
  'Almost there. These fields are optional but they get more likes.',
  'Last step — this is exactly how your card will look.',
]

const STEP_FIELDS = [[], ['title', 'wm', 'distro'], ['license', 'githubUrl'], []]

const CHIP_FIELDS = [
  { name: 'wm', step: 1, label: 'Window manager / DE', required: 'Select a WM / DE', options: ['Hyprland', 'Niri', 'i3', 'Sway', 'MangoWM', 'bspwm', 'dwm', 'Omarchy', 'Qtile', 'AwesomeWM', 'XFCE', 'KDE', 'GNOME', 'Other'] },
  { name: 'distro', step: 1, label: 'Distro', required: 'Select a distro', options: ['Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'CachyOS', 'Pop!_OS', 'openSUSE', 'Other'] },
  { name: 'license', step: 2, label: 'License', required: 'Select a license', options: ['MIT', 'GPL-3.0', 'Apache-2.0', 'Unlicense', 'BSD-3-Clause', 'MPL-2.0', 'None'] },
]

const GITHUB_RULES = {
  required: 'GitHub repo URL is required',
  pattern: {
    value: /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(?:\/)?$/,
    message: 'Must be a GitHub repo URL (e.g. https://github.com/user/repo)',
  },
  validate: async (value) => {
    const m = value.match(/github\.com\/([^/]+)\/([^/?#]+)/)
    if (!m) return 'Invalid GitHub repo URL'
    try {
      const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`)
      if (r.status === 404) return 'Repository not found'
      return r.ok || 'Could not verify repository'
    } catch {
      return 'Could not verify repository'
    }
  },
}

const HEX = /^#[0-9A-Fa-f]{6}$/
const MAX_COLORS = 10

const STEP_MOTION = {
  variants: { enter: { opacity: 0, x: 24 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } },
  initial: 'enter',
  animate: 'center',
  exit: 'exit',
  transition: { duration: 0.25 },
  className: 'flex flex-col gap-6',
}

const INPUT = 'w-full px-4 py-3.5 rounded-2xl bg-surface-2 text-sm text-text placeholder:text-muted outline-none transition-colors duration-200'
const BTN_PRIMARY = 'flex items-center justify-center gap-2 py-3.5 rounded-full bg-accent hover:bg-accent-dim disabled:opacity-40 text-surface text-sm cursor-pointer transition-colors duration-200'
const BTN_BACK = 'flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-sm cursor-pointer transition-colors duration-200'

function generateSlug(author, title) {
  const base = `${author || 'anonymous'}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base}-${Math.random().toString(36).slice(2, 8)}`
}

function formatCountdown(total) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

// Advisory gate only. The authoritative limit is enforced server-side by
// `record_submission_attempt` inside the submit-rice function, so a network
// failure here fails open instead of locking out a legitimate user.
function useRateLimit() {
  const [state, setState] = useState({ loading: true, allowed: true, seconds: 0 })

  const recheck = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rate-limit`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      })
      if (!res.ok) throw new Error('rate-limit unavailable')
      const data = await res.json()
      setState({
        loading: false,
        allowed: data.allowed === false ? false : true,
        seconds: Number(data.retry_after_seconds) || 0,
      })
    } catch {
      setState({ loading: false, allowed: true, seconds: 0 })
    }
  }, [])

  useEffect(() => { recheck() }, [recheck])

  const blocked = !state.allowed && state.seconds > 0
  useEffect(() => {
    if (!blocked) return
    const id = setInterval(() => setState((s) => ({ ...s, seconds: Math.max(0, s.seconds - 1) })), 1000)
    return () => clearInterval(id)
  }, [blocked])

  return { ...state, recheck }
}

function useImageUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const dropzone = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    onDropAccepted: ([accepted]) => {
      setFile(accepted)
      setPreview(URL.createObjectURL(accepted))
    },
    onDropRejected: () => toast.error('Image must be under 8MB.'),
  })

  const clear = () => {
    setPreview((url) => { if (url) URL.revokeObjectURL(url); return null })
    setFile(null)
  }

  return { file, preview, clear, ...dropzone }
}

function FieldError({ message }) {
  return message ? <p className="text-xs text-red-300 mt-1.5">{message}</p> : null
}

function ChipGroup({ field, value, error, onChange }) {
  return (
    <div>
      <p className="text-xs text-muted mb-2">{field.label}</p>
      <div className={clsx('flex flex-wrap gap-1.5', error && 'ring-1 ring-red-400/40 rounded-xl p-2')}>
        {field.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === value ? '' : opt)}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition-colors duration-200',
              value === opt ? 'bg-accent text-surface' : 'bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      <FieldError message={error?.message} />
    </div>
  )
}

function Nav({ onBack, onNext, label, disabled, loading }) {
  return (
    <div className={clsx('flex gap-3', onBack && 'pt-2')}>
      {onBack && (
        <button type="button" onClick={onBack} className={BTN_BACK}>
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
        </button>
      )}
      <button
        type={onNext ? 'button' : 'submit'}
        onClick={onNext}
        disabled={disabled}
        className={clsx(BTN_PRIMARY, onBack ? 'flex-1' : 'w-full')}
      >
        {loading
          ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-4 h-4" />
          : <><span>{label}</span><FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" /></>}
      </button>
    </div>
  )
}

function ProgressBar({ step }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors duration-200',
              i === step ? 'bg-accent text-surface' : i < step ? 'bg-surface-3 text-text-dim' : 'bg-surface-2 text-muted'
            )}
          >
            {i < step
              ? <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
              : <span className="text-[10px] font-medium">{i + 1}</span>}
            <span className="text-[11px] hidden sm:block">{label}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

function PreviewCard({ title, author, wm, palette, preview }) {
  return (
    <div className="w-full">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-2">
        {preview
          ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><span className="text-xs text-muted">No preview</span></div>}
        {wm && <span className="absolute top-3 left-3 px-3 py-2 rounded-full bg-surface/80 text-[11px] font-medium text-text-dim">{wm}</span>}
        {palette.length > 0 && (
          <div className="absolute bottom-3 right-3 flex -space-x-1">
            {palette.slice(0, 5).map((color) => (
              <div key={color} className="w-4 h-4 rounded-full ring-2 ring-surface" style={{ backgroundColor: color }} />
            ))}
          </div>
        )}
      </div>
      <div className="pt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-medium text-text leading-snug truncate">{title || 'Your untitled rice'}</h3>
          <p className="mt-1 text-[13px] text-muted truncate">{author || 'anonymous'} · just now</p>
        </div>
        <div className="flex items-center gap-1 text-[12.5px] text-muted flex-shrink-0 pt-0.5"><span>0</span></div>
      </div>
    </div>
  )
}

function RateLimitScreen({ seconds, onRecheck }) {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="flex flex-col items-center text-center gap-4 py-16">
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-text-dim" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text mb-2">One submission per hour</h1>
          <p className="text-sm text-text-dim max-w-sm">You've already submitted a rice recently. You can submit again in</p>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-accent tabular-nums">
          {seconds > 0 ? formatCountdown(seconds) : 'now'}
        </p>
        {seconds === 0 && (
          <button
            type="button"
            onClick={onRecheck}
            className="mt-2 px-5 py-3 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}

export default function Submit() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [palette, setPalette] = useState([])
  const [colorInput, setColorInput] = useState('#')
  const [token, setToken] = useState(null)

  const { register, handleSubmit, watch, trigger, setValue, clearErrors, formState: { errors } } = useForm({
    defaultValues: { wm: '', distro: '', license: '' },
  })

  const rateLimit = useRateLimit()
  const image = useImageUpload()
  const values = watch()

  for (const field of CHIP_FIELDS) register(field.name, { required: field.required })

  const addColor = () => {
    const hex = colorInput.trim()
    if (!HEX.test(hex)) return toast.error('Enter a valid hex, e.g. #1e1e2e')
    if (palette.includes(hex) || palette.length >= MAX_COLORS) return
    setPalette((p) => [...p, hex])
    setColorInput('#')
  }

  const next = async () => {
    if (step === 0 && !image.file) return toast.error('Please upload a screenshot first.')
    if (await trigger(STEP_FIELDS[step])) setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    if (!token) return toast.error('Please complete the captcha.')

    setSubmitting(true)
    const id = toast.loading('Optimizing image...')
    try {
      const [thumb, full] = await Promise.all([makeThumbnail(image.file), makeFullImage(image.file)])

      toast.loading('Uploading...', { id })
      const [thumbnail_url, image_url] = await Promise.all([uploadImage(thumb), uploadImage(full)])

      toast.loading('Saving...', { id })
      const { error } = await supabase.functions.invoke('submit-rice', {
        body: {
          turnstileToken: token,
          riceData: {
            title: data.title,
            author: data.author || 'anonymous',
            description: data.description || '',
            github_url: data.githubUrl || '',
            notes: data.notes || '',
            wm: data.wm,
            distro: data.distro,
            palette,
            license: data.license,
            image_url,
            thumbnail_url,
            slug: generateSlug(data.author, data.title),
            status: 'pending',
            views: 0,
            likes: 0,
            dislikes: 0,
          },
        },
      })
      if (error) throw error

      toast.success('Submitted!', { id })
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong.', { id })
    } finally {
      setSubmitting(false)
    }
  }

  if (rateLimit.loading) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        <div className="flex items-center justify-center py-24">
          <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-5 h-5 text-text-dim" />
        </div>
      </div>
    )
  }

  if (!rateLimit.allowed && rateLimit.seconds > 0) {
    return <RateLimitScreen seconds={rateLimit.seconds} onRecheck={rateLimit.recheck} />
  }

  const card = { title: values.title, author: values.author, wm: values.wm, palette, preview: image.preview }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <SEO
        title="Submit Your Rice"
        description="Share your Linux desktop configuration with the community. Upload a screenshot, add details about your window manager, distro, and color palette."
        url="/submit"
        type="website"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Submit' }]}
      />

      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text mb-2">Share your setup</h1>
        <p className="text-sm text-text-dim">{STEP_HINTS[step]}</p>
      </div>

      <ProgressBar step={step} />

      <div className={clsx('mt-10 grid gap-10 items-start', step > 0 && 'lg:grid-cols-[1fr_320px]')}>
        <form onSubmit={handleSubmit(onSubmit)} className="min-w-0">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" {...STEP_MOTION}>
                <div
                  {...image.getRootProps()}
                  className={clsx(
                    'relative rounded-3xl cursor-pointer overflow-hidden transition-colors duration-200',
                    image.isDragActive ? 'bg-accent/10' : 'bg-surface-2 hover:bg-surface-3'
                  )}
                >
                  <input {...image.getInputProps()} />
                  <AnimatePresence mode="wait">
                    {image.preview ? (
                      <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                        <img src={image.preview} alt="Preview" className="w-full object-cover max-h-72 rounded-3xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface/70 to-transparent rounded-3xl pointer-events-none" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); image.clear() }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 flex items-center justify-center text-text hover:bg-surface cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-3 left-3 text-[11px] text-text-dim">Click to replace</span>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-11 h-11 rounded-full bg-surface-3 flex items-center justify-center">
                          <FontAwesomeIcon icon={faCloudArrowUp} className="w-4 h-4 text-text-dim" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-text-dim">Drop your screenshot here</p>
                          <p className="text-xs text-muted mt-0.5">PNG, JPG, WEBP — max 8MB</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Nav onNext={next} label="Continue" />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" {...STEP_MOTION}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      className={clsx(INPUT, errors.title ? 'ring-1 ring-red-400/40' : 'focus:bg-surface-3')}
                      placeholder="Title — e.g. Minimal Hyprland + Catppuccin"
                      {...register('title', {
                        required: 'Title is required',
                        minLength: { value: 3, message: 'Title must be at least 3 characters' },
                      })}
                    />
                    <FieldError message={errors.title?.message} />
                  </div>
                  <input className={clsx(INPUT, 'focus:bg-surface-3')} placeholder="Author (optional)" {...register('author')} />
                </div>

                <textarea
                  rows={3}
                  className={clsx(INPUT, 'resize-none focus:bg-surface-3')}
                  placeholder="Description — what makes your setup special..."
                  {...register('description')}
                />

                {CHIP_FIELDS.filter((f) => f.step === 1).map((field) => (
                  <ChipGroup
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    error={errors[field.name]}
                    onChange={(val) => { setValue(field.name, val); clearErrors(field.name) }}
                  />
                ))}

                <Nav onBack={() => setStep(0)} onNext={next} label="Continue" />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" {...STEP_MOTION}>
                <div>
                  <div className="relative">
                    <FontAwesomeIcon icon={faGithub} className="absolute left-4 inset-y-0 m-auto text-muted w-4 h-4" />
                    <input
                      className={clsx(INPUT, 'pl-11', errors.githubUrl ? 'ring-1 ring-red-400/40' : 'focus:bg-surface-3')}
                      placeholder="https://github.com/you/dotfiles"
                      {...register('githubUrl', GITHUB_RULES)}
                    />
                  </div>
                  <FieldError message={errors.githubUrl?.message} />
                </div>

                {CHIP_FIELDS.filter((f) => f.step === 2).map((field) => (
                  <ChipGroup
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    error={errors[field.name]}
                    onChange={(val) => { setValue(field.name, val); clearErrors(field.name) }}
                  />
                ))}

                <div>
                  <p className="text-xs text-muted mb-2">Color palette</p>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface-3"
                        style={{ backgroundColor: HEX.test(colorInput) ? colorInput : undefined }}
                      />
                      <input
                        className={clsx(INPUT, 'pl-11 font-mono text-xs focus:bg-surface-3')}
                        placeholder="#1e1e2e"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor() } }}
                      />
                    </div>
                    <button type="button" onClick={addColor} className="px-5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-xs cursor-pointer transition-colors duration-200">+</button>
                  </div>
                  {palette.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {palette.map((color) => (
                        <div key={color} className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full bg-surface-2">
                          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[11px] font-mono text-text-dim">{color}</span>
                          <button
                            type="button"
                            onClick={() => setPalette((p) => p.filter((c) => c !== color))}
                            className="text-muted hover:text-text-dim ml-0.5 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <textarea
                  rows={4}
                  className={clsx(INPUT, 'resize-none font-mono text-xs focus:bg-surface-3')}
                  placeholder="Notes / config snippets — shell, font, terminal, compositor..."
                  {...register('notes')}
                />

                <Nav onBack={() => setStep(1)} onNext={next} label="Review" />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" {...STEP_MOTION}>
                <div className="lg:hidden"><PreviewCard {...card} /></div>

                {(values.license || values.githubUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {values.license && <span className="px-3 py-1.5 rounded-full text-[11px] bg-surface-2 text-text-dim">{values.license}</span>}
                    {values.githubUrl && <span className="px-3 py-1.5 rounded-full text-[11px] bg-surface-2 text-text-dim truncate max-w-[220px]">{values.githubUrl}</span>}
                  </div>
                )}

                <p className="text-[11px] text-center text-muted">Your submission will be reviewed before appearing publicly.</p>

                <Turnstile siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} onSuccess={setToken} options={{ theme: 'dark' }} />

                <Nav onBack={() => setStep(2)} label="Submit rice" disabled={submitting || !token} loading={submitting} />
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {step > 0 && (
          <div className="hidden lg:block sticky top-28">
            <p className="text-xs text-muted mb-3">This is how your card will look</p>
            <PreviewCard {...card} />
          </div>
        )}
      </div>
    </div>
  )
}
