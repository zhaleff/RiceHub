import { useEffect, useState } from 'react'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import PillButton from './PillButton'

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <PillButton
      small
      icon={copied ? faCheck : faCopy}
      label={copied ? 'Copied' : 'Copy'}
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
    />
  )
}
