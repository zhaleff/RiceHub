import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCloudArrowUp, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { STEP_VARIANTS, STEP_TRANSITION } from './constants'
import { BTN_PRIMARY_FULL } from './FormFields'

export default function StepScreenshot({ imagePreview, isDragActive, getRootProps, getInputProps, clearImage, onNext }) {
  return (
    <motion.div key="step0" variants={STEP_VARIANTS} initial="enter" animate="center" exit="exit" transition={STEP_TRANSITION} className="flex flex-col gap-6">
      <div
        {...getRootProps()}
        className={clsx(
          'relative rounded-3xl cursor-pointer overflow-hidden transition-colors duration-200',
          isDragActive ? 'bg-accent/10' : 'bg-surface-2 hover:bg-surface-3'
        )}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {imagePreview ? (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-72 rounded-3xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/70 to-transparent rounded-3xl pointer-events-none" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearImage() }}
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
      <button type="button" onClick={onNext} className={BTN_PRIMARY_FULL}>
        Continue <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}