import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Image, MapPin, Tag, Calendar, ChevronDown, Check, Loader2 } from 'lucide-react'
import { cn, withTimeout } from '../lib/utils'
import { CATEGORIES } from '../lib/constants'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { compressImage, uploadImages } from '../lib/storage'

export default function CreatePage() {
  const navigate = useNavigate()
  const { user, gardenId } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [media, setMedia] = useState([])
  const [locationName, setLocationName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const previewUrlsRef = useRef([])

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const newMedia = files.map(file => {
      const previewUrl = URL.createObjectURL(file)
      previewUrlsRef.current.push(previewUrl)
      return {
        id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
        file,
        preview: previewUrl,
        type: 'image',
      }
    })
    setMedia(prev => [...prev, ...newMedia])
    e.target.value = ''
  }

  const handleRemoveMedia = (id) => {
    const item = media.find(m => m.id === id)
    if (item?.preview) {
      URL.revokeObjectURL(item.preview)
      previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== item.preview)
    }
    setMedia(media.filter(m => m.id !== id))
  }

  const handlePublish = async () => {
    if (!title && media.length === 0) return
    if (!gardenId) {
      setError('花园尚未就绪，请稍后再试')
      return
    }

    setIsPublishing(true)
    setError('')

    try {
      // 1. Create the record
      setUploadProgress('保存记录...')
      const { data: record, error: recordError } = await withTimeout(
        supabase
          .from('records')
          .insert({
            garden_id: gardenId,
            author_id: user.id,
            title: title || '',
            content: content || '',
            category: category || 'daily',
            custom_tags: tags,
            location_name: locationName || '',
            recorded_at: date,
          })
          .select()
          .single(),
        15000,
        '保存记录'
      )

      if (recordError) throw new Error('保存记录失败: ' + recordError.message)

      // 2. Upload images if any
      const imageFiles = media.filter(m => m.type === 'image').map(m => m.file)
      if (imageFiles.length > 0) {
        setUploadProgress(`上传 ${imageFiles.length} 张照片...`)
        const mediaEntries = await uploadImages(imageFiles, gardenId, record.id)

        // 3. Save media entries to database
        if (mediaEntries.length > 0) {
          setUploadProgress('保存照片信息...')
          const { error: mediaError } = await withTimeout(
            supabase
              .from('media')
              .insert(mediaEntries),
            15000,
            '保存照片信息'
          )
          if (mediaError) throw new Error('保存照片信息失败: ' + mediaError.message)
        }
      }

      setUploadProgress('')
      // 4. Navigate back to feed
      navigate('/feed', { replace: true })
    } catch (err) {
      setError(err.message || '发布失败，请重试')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-dvh bg-milk-50 dark:bg-dark-bg flex flex-col transition-theme">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass dark:glass-dark safe-top">
        <div className="flex items-center justify-between h-12 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
          >
            <X className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
          <h1 className="text-base font-semibold text-milk-900 dark:text-milk-100">
            新记录
          </h1>
          <button
            onClick={handlePublish}
            disabled={isPublishing || (!title && media.length === 0)}
            className={cn(
              'px-5 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5',
              isPublishing
                ? 'bg-milk-200 dark:bg-dark-border text-milk-400 cursor-not-allowed'
                : title || media.length > 0
                  ? 'gradient-coral text-white shadow-sm active:scale-95'
                  : 'bg-milk-200 dark:bg-dark-border text-milk-400 cursor-not-allowed'
            )}
          >
            {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPublishing ? (uploadProgress || '发布中') : '发布'}
          </button>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-tulip-50 dark:bg-tulip-900/20 border border-tulip-100 dark:border-tulip-800/30 text-sm text-tulip-600 dark:text-tulip-400">
          {error}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
        {/* Title */}
        <input
          type="text"
          placeholder="给这条记录取个名字..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl font-medium bg-transparent text-milk-900 dark:text-milk-100 placeholder:text-milk-300 dark:placeholder:text-milk-600 focus:outline-none"
        />

        {/* Media grid */}
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {media.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={item.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveMedia(item.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}
            {/* Add more button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-milk-300 dark:border-dark-border flex flex-col items-center justify-center gap-1 hover:bg-milk-100 dark:hover:bg-dark-card transition-colors"
            >
              <Image className="w-6 h-6 text-milk-400" />
              <span className="text-xs text-milk-400">添加</span>
            </button>
          </div>
        )}

        {/* Text content */}
        <textarea
          placeholder="记录这一刻的心情..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full text-base bg-transparent text-milk-800 dark:text-milk-200 placeholder:text-milk-300 dark:placeholder:text-milk-600 focus:outline-none resize-none leading-relaxed"
        />

        {/* Divider */}
        <div className="border-t border-milk-200 dark:border-dark-border" />

        {/* Metadata row */}
        <div className="space-y-3">
          {/* Category */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-100 dark:bg-dark-card hover:bg-milk-200 dark:hover:bg-dark-border transition-colors w-full"
            >
              <Tag className="w-4 h-4 text-apricot-500" />
              <span className={cn(
                'text-sm',
                category ? 'text-milk-800 dark:text-milk-200' : 'text-milk-400'
              )}>
                {category ? CATEGORIES.find(c => c.id === category)?.label : '选择分类'}
              </span>
              <ChevronDown className="w-4 h-4 text-milk-400 ml-auto" />
            </button>

            {showCategoryPicker && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-dark-card rounded-xl shadow-lg border border-milk-200 dark:border-dark-border overflow-hidden z-10">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setShowCategoryPicker(false) }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-milk-100 dark:hover:bg-dark-border transition-colors"
                  >
                    <span>{cat.emoji}</span>
                    <span className="text-sm text-milk-800 dark:text-milk-200">{cat.label}</span>
                    {category === cat.id && <Check className="w-4 h-4 text-apricot-500 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-apricot-100 dark:bg-dark-border text-sm text-apricot-700 dark:text-apricot-300"
              >
                #{tag}
                <button onClick={() => handleRemoveTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="+ 添加标签"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 min-w-[100px] text-sm bg-transparent text-milk-800 dark:text-milk-200 placeholder:text-milk-400 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-100 dark:bg-dark-card">
            <MapPin className="w-4 h-4 text-apricot-500" />
            <input
              type="text"
              placeholder="添加地点"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="flex-1 text-sm bg-transparent text-milk-800 dark:text-milk-200 placeholder:text-milk-400 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-100 dark:bg-dark-card hover:bg-milk-200 dark:hover:bg-dark-border transition-colors w-full">
            <Calendar className="w-4 h-4 text-apricot-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm bg-transparent text-milk-800 dark:text-milk-200 focus:outline-none flex-1"
            />
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bottom action bar */}
      <div className="sticky bottom-0 glass dark:glass-dark border-t border-milk-200/60 dark:border-dark-border/60 px-4 py-3 safe-bottom">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-milk-600 dark:text-milk-400 hover:text-apricot-500 transition-colors"
          >
            <Image className="w-5 h-5" />
            照片
          </button>
        </div>
      </div>
    </div>
  )
}
