import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { BTN_GHOST } from './buttonStyles'

export default function PageHeader({ heading, loading, onRefresh }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-5 mb-10">
      <div>
        <h1 className="text-5xl sm:text-4xl lg:text-6xl font-semibold text-text">{heading}</h1>
      </div>
      <button onClick={onRefresh} disabled={loading} className={BTN_GHOST}>
        <FontAwesomeIcon icon={faRotate} className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
        Refresh
      </button>
    </div>
  )
}
