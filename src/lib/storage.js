import { supabase } from './supabase'

/**
 * Compress an image file using Canvas API.
 * Returns a Blob (JPEG) with reduced dimensions.
 */
export async function compressImage(file, { maxWidth = 1080, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width))
        width = maxWidth
      }
      if (height > maxWidth) {
        width = Math.round(width * (maxWidth / height))
        height = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('图片压缩失败'))
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}

/**
 * Upload a compressed image to Supabase Storage.
 * Path: media/{gardenId}/{recordId}/{filename}
 * Returns the public URL.
 */
export async function uploadImage(blob, gardenId, recordId, originalName) {
  const ext = 'jpg' // compressed to JPEG
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '')
  const filename = `${safeName}_${Date.now()}.${ext}`
  const path = `${gardenId}/${recordId}/${filename}`

  const { data, error } = await supabase.storage
    .from('media')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) throw new Error('图片上传失败: ' + error.message)

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(path)

  return {
    path: data.path,
    url: urlData.publicUrl,
    filename,
  }
}

/**
 * Upload multiple images and return media entries for the records.
 */
export async function uploadImages(files, gardenId, recordId) {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const blob = await compressImage(file)
    const uploaded = await uploadImage(blob, gardenId, recordId, file.name || `photo_${i}`)

    results.push({
      record_id: recordId,
      type: 'image',
      original_url: uploaded.url,
      compressed_url: uploaded.url,
      thumbnail_url: uploaded.url,
      sort_order: i,
    })
  }

  return results
}

/**
 * Delete media files from storage.
 */
export async function deleteMediaFiles(paths) {
  if (!paths.length) return
  const { error } = await supabase.storage.from('media').remove(paths)
  if (error) console.warn('Failed to delete media files:', error.message)
}
