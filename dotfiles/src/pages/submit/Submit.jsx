import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faXmark, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import clsx from 'clsx'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/imgbb'
import { makeThumbnail, makeFullImage } from '../../lib/imageresized'
import SEO from '../../components/SEO'
import { CHIP_FIELDS, STEP_FIELDS, STEP_HINTS, STEP_MOTION, GITHUB_RULES, INPUT, HEX, MAX_COLORS } from './constants'
import { generateSlug } from './lib'
import { useRateLimit, useImageUpload } from './hooks'
import ChipGroup from './components/ChipGroup'
import FieldError from './components/FieldError'
import Nav from './components/Nav'
import ProgressBar from './components/ProgressBar'
import PreviewCard from './components/PreviewCard'
import RateLimitScreen from './components/RateLimitScreen'

export default function Submit() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [palette, setPalette] = useState([])
  const [colorInput, setColorInput] = useState('#')
  const [token, setToken] = useState(null)

  const { control, register, handleSubmit, trigger, setValue, clearErrors, formState: { errors } } = useForm({
    defaultValues: { wm: '', distro: '', license: '' },
  })

  const rateLimit = useRateLimit()
  const image = useImageUpload()
  const values = useWatch({ control })

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
