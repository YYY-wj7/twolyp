import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Image, Film, MapPin, Tag, Calendar, ChevronDown, Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { CATEGORIES } from '../lib/constants'

export default function CreatePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [media, setMedia] = useState([])
  const [location, setLocation] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)

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
    const newMedia = files.map(file => ({
      id: crypto.randomUUID?.() || Date.now().toString(36),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      caption: '',
    }))
    setMedia([...media, ...newMedia])
  }

  const handleRemoveMedia = (id) => {
    setMedia(media.filter(m => m.id !== id))
  }

  const handlePublish = () => {
    // TODO: Implement publish logic with encryption + upload
    console.log('Publishing:', { title, content, category, tags, media, location, date })
    navigate('/feed')
  }

  return (
    <div className="min-h-dvh bg-milk-50 dark:bg-dark-bg flex flex-col transition-theme">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-milk-50/90 dark:bg-dark-bg/90 backdrop-blur-xl safe-top">
        <div className="flex items-center justify-between h-12 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
          >
            <X className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
          <h1 className="text-base font-medium text-milk-900 dark:text-milk-100">
            新记录
          </h1>
          <button
            onClick={handlePublish}
            disabled={!title && media.length === 0}
            className={cn(
              'px-5 py-1.5 rounded-full text-sm font-medium transition-all',
              title || media.length > 0
                ? 'bg-apricot-400 text-white active:scale-95'
                : 'bg-milk-200 dark:bg-dark-border text-milk-400 cursor-not-allowed'
            )}
          >
            发布
          </button>
        </div>
      </header>

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
                {item.type === 'video' ? (
                  <video src={item.preview} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => handleRemoveMedia(item.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                {item.type === 'video' && (
                  <div className="absolute bottom-1.5 left-1.5">
                    <Film className="w-4 h-4 text-white drop-shadow" />
                  </div>
                )}
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
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 min-w-[100px] text-sm bg-transparent text-milk-800 dark:text-milk-200 placeholder:text-milk-400 focus:outline-none"
            />
          </div>

          {/* Location */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-100 dark:bg-dark-card hover:bg-milk-200 dark:hover:bg-dark-border transition-colors w-full">
            <MapPin className="w-4 h-4 text-apricot-500" />
            <span className="text-sm text-milk-400">
              {location || '添加地点'}
            </span>
          </button>

          {/* Date (for backdating) */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-100 dark:bg-dark-card hover:bg-milk-200 dark:hover:bg-dark-border transition-colors w-full">
            <Calendar className="w-4 h-4 text-apricot-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm bg-transparent text-milk-800 dark:text-milk-200 focus:outline-none flex-1"
            />
          </button>
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
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bottom action bar */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl border-t border-milk-200 dark:border-dark-border px-4 py-3 safe-bottom">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-milk-600 dark:text-milk-400 hover:text-apricot-500 transition-colors"
          >
            <Image className="w-5 h-5" />
            照片
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-milk-600 dark:text-milk-400 hover:text-apricot-500 transition-colors"
          >
            <Film className="w-5 h-5" />
            视频
          </button>
          <button
            onClick={() => {/* TODO: open location picker */}}
            className="flex items-center gap-1.5 text-sm text-milk-600 dark:text-milk-400 hover:text-apricot-500 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            地点
          </button>
        </div>
      </div>
    </div>
  )
}
