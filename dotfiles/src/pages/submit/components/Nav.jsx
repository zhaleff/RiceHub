import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { BTN_BACK, BTN_PRIMARY } from '../constants'

export default function Nav({ onBack, onNext, label, disabled, loading }) {
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
