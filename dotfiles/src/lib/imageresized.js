// Resizes + compresses an image File using the Canvas API, no dependencies.
// Returns a new File (WebP) that's much lighter than the original.
function resizeImage(file, { maxWidth, quality }) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const scale = Math.min(1, maxWidth / img.width)
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Image compression failed')); return }
          const newName = file.name.replace(/\.[^.]+$/, '') + '.webp'
          resolve(new File([blob], newName, { type: 'image/webp' }))
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
    img.src = url
  })
}

// Small, heavily compressed — used in the gallery grid cards.
export function makeThumbnail(file) {
  return resizeImage(file, { maxWidth: 600, quality: 0.6 })
}

// Larger, higher quality — used on the rice detail page.
export function makeFullImage(file) {
  return resizeImage(file, { maxWidth: 1920, quality: 0.85 })
}
