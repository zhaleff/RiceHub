import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

export function useImageUpload() {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    onDropAccepted: ([file]) => {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    },
    onDropRejected: () => toast.error('Image must be under 8MB.'),
  })

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  return { imageFile, imagePreview, getRootProps, getInputProps, isDragActive, clearImage }
}