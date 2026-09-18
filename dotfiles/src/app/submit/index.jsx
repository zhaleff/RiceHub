import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/imgbb'
import { makeThumbnail, makeFullImage } from '../../lib/imageresized'
import SEO from '../../components/SEO'
import { STEP_HINTS } from './constants'
import { generateSlug } from './utils'
import { useRateLimit } from './useRateLimit'
import { useImageUpload } from './useImageUpload'
import ProgressBar from './ProgressBar'
import RicePreviewCard from './RicePreviewCard'
import RateLimitScreen from './RateLimitScreen'
import StepScreenshot from './StepScreenshot'
import StepDetails from './StepDetails'
import StepConfig from './StepConfig'
import StepReview from './StepReview'

export default function Submit() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [palette, setPalette] = useState([])
  const [turnstileToken, setTurnstileToken] = useState(null)
  const [colorInput, setColorInput] = useState('#')
  const { register, handleSubmit, watch, trigger, setValue, clearErrors, formState: { errors } } = useForm({ defaultValues: { wm: '', distro: '', license: '' } })

  const { loading: rateLimitLoading, allowed, retryAfter } = useRateLimit()
  const { imageFile, imagePreview, getRootProps, getInputProps, isDragActive, clearImage } = useImageUpload()

  const title = watch('title')
  const author = watch('author')
  const wm = watch('wm')
  const distro = watch('distro')
  const license = watch('license')
  const githubUrl = watch('githubUrl')

  register('wm', { required: 'Select a WM / DE' })
  register('distro', { required: 'Select a distro' })
  register('license', { required: 'Select a license' })

  const addColor = () => {
    const hex = colorInput.trim()
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) { toast.error('Enter a valid hex, e.g. #1e1e2e'); return }
    if (palette.includes(hex) || palette.length >= 10) return
    setPalette((p) => [...p, hex])
    setColorInput('#')
  }

  const removeColor = (color) => setPalette((p) => p.filter((x) => x !== color))

  const next = async () => {
    if (step === 0 && !imageFile) { toast.error('Please upload a screenshot first.'); return }
    if (step === 1) {
      const valid = await trigger(['title', 'wm', 'distro'])
      if (!valid) return
    }
    if (step === 2) {
      const valid = await trigger(['license', 'githubUrl'])
      if (!valid) return
    }
    setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    if (!allowed) return

    const valid = await trigger(['title', 'wm', 'distro', 'license', 'githubUrl'])
    if (!valid) return
    if (!turnstileToken) { toast.error('Please complete the captcha.'); return }

    setSubmitting(true)
    const toastId = toast.loading('Optimizing image...')
    try {
      const [thumbnailFile, fullFile] = await Promise.all([
        makeThumbnail(imageFile),
        makeFullImage(imageFile),
      ])

      toast.loading('Uploading...', { id: toastId })
      const [thumbnail_url, image_url] = await Promise.all([
        uploadImage(thumbnailFile),
        uploadImage(fullFile),
      ])
      toast.loading('Saving...', { id: toastId })

      const slug = generateSlug(data.author, data.title)

      const { error } = await supabase.functions.invoke('submit-rice', {
        body: {
          turnstileToken,
          riceData: {
            title: data.title,
            author: data.author || 'anonymous',
            description: data.description || '',
            github_url: data.githubUrl || '',
            notes: data.notes || '',
            wm,
            distro,
            palette,
            license,
            image_url,
            thumbnail_url,
            slug,
            status: 'pending',
            views: 0,
            likes: 0,
            dislikes: 0,
          },
        },
      })

      if (error) throw error

      toast.success('Submitted!', { id: toastId })
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const showPreview = step > 0

  if (rateLimitLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        <div className="flex items-center justify-center py-24">
          <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-5 h-5 text-text-dim" />
        </div>
      </div>
    )
  }

  if (!allowed) {
    return <RateLimitScreen retryAfter={retryAfter} />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <SEO
        title="Submit Your Rice"
        description="Share your Linux desktop configuration with the community. Upload a screenshot, add details about your window manager, distro, and color palette."
        url="/submit"
        type="website"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Submit' },
        ]}
      />
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text mb-2">Share your setup</h1>
        <p className="text-sm text-text-dim">{STEP_HINTS[step]}</p>
      </div>

      <ProgressBar step={step} />

      <div className={clsx('mt-10 grid gap-10 items-start', showPreview && 'lg:grid-cols-[1fr_320px]')}>
        <form onSubmit={handleSubmit(onSubmit)} className="min-w-0">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepScreenshot
                imagePreview={imagePreview}
                isDragActive={isDragActive}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                clearImage={clearImage}
                onNext={next}
              />
            )}
            {step === 1 && (
              <StepDetails
                register={register}
                errors={errors}
                wm={wm}
                distro={distro}
                setValue={setValue}
                clearErrors={clearErrors}
                onBack={() => setStep(0)}
                onNext={next}
              />
            )}
            {step === 2 && (
              <StepConfig
                register={register}
                errors={errors}
                license={license}
                setValue={setValue}
                clearErrors={clearErrors}
                colorInput={colorInput}
                onColorInputChange={setColorInput}
                onAddColor={addColor}
                palette={palette}
                onRemoveColor={removeColor}
                onBack={() => setStep(1)}
                onNext={next}
              />
            )}
            {step === 3 && (
              <StepReview
                title={title}
                author={author}
                wm={wm}
                license={license}
                githubUrl={githubUrl}
                palette={palette}
                imagePreview={imagePreview}
                turnstileToken={turnstileToken}
                onTurnstileSuccess={setTurnstileToken}
                submitting={submitting}
                onBack={() => setStep(2)}
              />
            )}
          </AnimatePresence>
        </form>

        {showPreview && (
          <div className="hidden lg:block sticky top-28">
            <p className="text-xs text-muted mb-3">This is how your card will look</p>
            <RicePreviewCard title={title} author={author} wm={wm} palette={palette} imagePreview={imagePreview} />
          </div>
        )}
      </div>
    </div>
  )
}