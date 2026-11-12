import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { EASE } from '../constants'

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-surface/95 flex items-center justify-center p-6 overflow-auto"
    >
      <motion.img
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded-2xl"
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed top-6 right-6 w-12 h-12 rounded-full bg-surface-2 text-text-dim hover:text-text transition-colors duration-200 cursor-pointer"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </motion.div>
  )
}
