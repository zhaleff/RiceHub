import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { fetchRateLimit } from './lib'

export function useRateLimit() {
  const [state, setState] = useState({ loading: true, allowed: true, seconds: 0 })

  const recheck = useCallback(async () => {
    setState(await fetchRateLimit())
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchRateLimit().then((next) => {
      if (!cancelled) setState(next)
    })
    return () => { cancelled = true }
  }, [])

  const blocked = !state.allowed && state.seconds > 0
  useEffect(() => {
    if (!blocked) return
    const id = setInterval(() => setState((s) => ({ ...s, seconds: Math.max(0, s.seconds - 1) })), 1000)
    return () => clearInterval(id)
  }, [blocked])

  return { ...state, recheck }
}

export function useImageUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const dropzone = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    onDropAccepted: ([accepted]) => {
      setFile(accepted)
      setPreview(URL.createObjectURL(accepted))
    },
    onDropRejected: () => toast.error('Image must be under 8MB.'),
  })

  const clear = () => {
    setPreview((url) => { if (url) URL.revokeObjectURL(url); return null })
    setFile(null)
  }

  return { file, preview, clear, ...dropzone }
}
