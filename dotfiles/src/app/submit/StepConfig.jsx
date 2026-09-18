import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { LICENSE_OPTIONS, STEP_VARIANTS, STEP_TRANSITION } from './constants'
import { FieldHint, FieldError, Field, Textarea, Chips, BTN_BACK, BTN_PRIMARY } from './FormFields'

export default function StepConfig({ register, errors, license, setValue, clearErrors, colorInput, onColorInputChange, onAddColor, palette, onRemoveColor, onBack, onNext }) {
  const githubUrl = register('githubUrl', {
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
        if (!r.ok) return 'Could not verify repository'
        return true
      } catch {
        return 'Could not verify repository'
      }
    },
  })

  return (
    <motion.div key="step2" variants={STEP_VARIANTS} initial="enter" animate="center" exit="exit" transition={STEP_TRANSITION} className="flex flex-col gap-6">
      <div>
        <div className="relative">
          <FontAwesomeIcon icon={faGithub} className="absolute left-4 inset-y-0 m-auto text-muted w-4 h-4" />
          <Field className="pl-11" placeholder="https://github.com/you/dotfiles" error={errors.githubUrl} {...githubUrl} />
        </div>
        {errors.githubUrl && <FieldError message={errors.githubUrl.message} />}
      </div>

      <div>
        <FieldHint>License</FieldHint>
        <Chips options={LICENSE_OPTIONS} value={license} onChange={(val) => { setValue('license', val); clearErrors('license') }} error={errors.license} />
        {errors.license && <FieldError message={errors.license.message} />}
      </div>

      <div>
        <FieldHint>Color palette</FieldHint>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface-3"
              style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorInput) ? colorInput : undefined }}
            />
            <Field className="pl-11 font-mono text-xs" placeholder="#1e1e2e" value={colorInput} onChange={(e) => onColorInputChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddColor())} />
          </div>
          <button type="button" onClick={onAddColor} className="px-5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-xs cursor-pointer transition-colors duration-200">+</button>
        </div>
        {palette.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {palette.map((color) => (
              <div key={color} className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full bg-surface-2">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-mono text-text-dim">{color}</span>
                <button type="button" onClick={() => onRemoveColor(color)} className="text-muted hover:text-text-dim ml-0.5 cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Textarea rows={4} placeholder="Notes / config snippets — shell, font, terminal, compositor..." className="font-mono text-xs" {...register('notes')} />

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className={BTN_BACK}>
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
        </button>
        <button type="button" onClick={onNext} className={BTN_PRIMARY}>
          Review <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}