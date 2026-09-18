import { motion } from 'framer-motion'
import { Turnstile } from '@marsidev/react-turnstile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { STEP_VARIANTS, STEP_TRANSITION } from './constants'
import { BTN_BACK, BTN_PRIMARY_DISABLED } from './FormFields'
import RicePreviewCard from './RicePreviewCard'

export default function StepReview({ title, author, wm, license, githubUrl, palette, imagePreview, turnstileToken, onTurnstileSuccess, submitting, onBack }) {
  return (
    <motion.div key="step3" variants={STEP_VARIANTS} initial="enter" animate="center" exit="exit" transition={STEP_TRANSITION} className="flex flex-col gap-6">
      <div className="lg:hidden">
        <RicePreviewCard title={title} author={author} wm={wm} palette={palette} imagePreview={imagePreview} />
      </div>

      {(license || githubUrl) && (
        <div className="flex flex-wrap gap-2">
          {license && <span className="px-3 py-1.5 rounded-full text-[11px] bg-surface-2 text-text-dim">{license}</span>}
          {githubUrl && <span className="px-3 py-1.5 rounded-full text-[11px] bg-surface-2 text-text-dim truncate max-w-[220px]">{githubUrl}</span>}
        </div>
      )}

      <p className="text-[11px] text-center text-muted">Your submission will be reviewed before appearing publicly.</p>

      <Turnstile
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onSuccess={onTurnstileSuccess}
        options={{ theme: 'dark' }}
      />

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className={BTN_BACK}>
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
        </button>
        <button type="submit" disabled={submitting || !turnstileToken} className={BTN_PRIMARY_DISABLED}>
          {submitting
            ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-4 h-4" />
            : <><span>Submit rice</span><FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" /></>}
        </button>
      </div>
    </motion.div>
  )
}