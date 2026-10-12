import { supabase } from './supabase'
import { withTimeout } from './utils'

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
  // Keep Chinese chars, just strip filesystem-dangerous characters
  const safeName = (originalName || 'photo')
    .replace(/\.[^.]+$/, '')          // remove extension
    .replace(/[\\/:*?"<>|]/g, '_')    // strip dangerous chars, keep Chinese
    .slice(0, 40) || 'photo'          // limit length, fallback
  const filename = `${safeName}_${Date.now()}.${ext}`
  const path = `${gardenId}/${recordId}/${filename}`

  const { data, error } = await withTimeout(
    supabase.storage
      .from('media')
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      }),
    60000,
    '上传图片'
  )

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
 * Generate a small thumbnail from a compressed blob using Canvas.
 * Returns a smaller JPEG blob (~300px).
 */
async function generateThumbnail(blob) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const maxDim = 300
      let { width, height } = img
      if (width > height) {
        height = Math.round(height * (maxDim / width))
        width = maxDim
      } else {
        width = Math.round(width * (maxDim / height))
        height = maxDim
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (thumbBlob) => resolve(thumbBlob || blob),
        'image/jpeg',
        0.7
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(blob) // fallback to original
    }

    img.src = url
  })
}

/**
 * Upload a thumbnail blob alongside the main image.
 * Returns the thumbnail public URL.
 */
async function uploadThumbnail(blob, gardenId, recordId, filename) {
  const thumbPath = `${gardenId}/${recordId}/thumb_${filename}`
  const { data, error } = await withTimeout(
    supabase.storage
      .from('media')
      .upload(thumbPath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      }),
    60000,
    '上传图片'
  )

  if (error) return null

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(thumbPath)

  return urlData.publicUrl
}

/**
 * Upload multiple images with parallel uploads (concurrency: 3).
 * Also generates and uploads thumbnails.
 */
export async function uploadImages(files, gardenId, recordId) {
  const CONCURRENCY = 3
  const results = []

  // Process files in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map(async (file, batchIdx) => {
        const idx = i + batchIdx
        const compressed = await compressImage(file)
        const uploaded = await uploadImage(compressed, gardenId, recordId, file.name || `photo_${idx}`)

        // Generate and upload thumbnail in parallel
        const [thumbBlob, _] = await Promise.all([
          generateThumbnail(compressed),
          Promise.resolve(null),
        ])
        const thumbUrl = await uploadThumbnail(thumbBlob, gardenId, recordId, uploaded.filename)

        return {
          record_id: recordId,
          type: 'image',
          original_url: uploaded.url,
          compressed_url: uploaded.url,
          thumbnail_url: thumbUrl || uploaded.url,
          sort_order: idx,
        }
      })
    )
    results.push(...batchResults)
  }

  return results
}

/**
 * Delete media files from storage.
 */
export async function deleteMediaFiles(paths) {
  if (!paths.length) return
  const { error } = await withTimeout(
    supabase.storage.from('media').remove(paths),
    60000,
    '上传图片'
  )
  if (error) console.warn('Failed to delete media files:', error.message)
}
