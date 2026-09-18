import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { WM_OPTIONS, DISTRO_OPTIONS, STEP_VARIANTS, STEP_TRANSITION } from './constants'
import { FieldHint, FieldError, Field, Textarea, Chips, BTN_BACK, BTN_PRIMARY } from './FormFields'

export default function StepDetails({ register, errors, wm, distro, setValue, clearErrors, onBack, onNext }) {
  return (
    <motion.div key="step1" variants={STEP_VARIANTS} initial="enter" animate="center" exit="exit" transition={STEP_TRANSITION} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Field placeholder="Title — e.g. Minimal Hyprland + Catppuccin" error={errors.title} {...register('title', { required: { value: true, message: 'Title is required' }, minLength: { value: 3, message: 'Title must be at least 3 characters' } })} />
          {errors.title && <FieldError message={errors.title.message} />}
        </div>
        <Field placeholder="Author (optional)" {...register('author')} />
      </div>

      <Textarea rows={3} placeholder="Description — what makes your setup special..." {...register('description')} />

      <div>
        <FieldHint>Window manager / DE</FieldHint>
        <Chips options={WM_OPTIONS} value={wm} onChange={(val) => { setValue('wm', val); clearErrors('wm') }} error={errors.wm} />
        {errors.wm && <FieldError message={errors.wm.message} />}
      </div>

      <div>
        <FieldHint>Distro</FieldHint>
        <Chips options={DISTRO_OPTIONS} value={distro} onChange={(val) => { setValue('distro', val); clearErrors('distro') }} error={errors.distro} />
        {errors.distro && <FieldError message={errors.distro.message} />}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className={BTN_BACK}>
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
        </button>
        <button type="button" onClick={onNext} className={BTN_PRIMARY}>
          Continue <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}