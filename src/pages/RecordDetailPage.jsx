import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, MapPin, Share2, MoreHorizontal, Trash2, Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn, formatDate, withTimeout } from '../lib/utils'
import { useAuth, useDB } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

export default function RecordDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, gardenId } = useAuth()
  const db = useDB()

  const [record, setRecord] = useState(null)
  const [media, setMedia] = useState([])
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [fetchError, setFetchError] = useState(null) // null | 'not_found' | 'network'
  const [shareToast, setShareToast] = useState('')

  const carouselRef = useRef(null)

  // Load like status from local DB
  useEffect(() => {
    if (!id || !db) return
    db.appSettings.get(`liked-${id}`).then(entry => {
      if (entry?.value) setIsLiked(true)
    }).catch(() => {})
  }, [id, db])

  const fetchRecord = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setFetchError(null)
    try {
      // Fetch record
      const { data: rec, error } = await withTimeout(
        supabase
          .from('records')
          .select('*, profiles!author_id(nickname, email, avatar_url)')
          .eq('id', id)
          .single(),
        15000
      )

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          setFetchError('not_found')
        } else {
          setFetchError('network')
        }
        throw error
      }
      setRecord(rec)

      // Fetch media
      const { data: mediaData } = await withTimeout(
        supabase
          .from('media')
          .select('*')
          .eq('record_id', id)
          .order('sort_order'),
        15000
      )
      setMedia(mediaData || [])

      // Fetch comments with author info
      const { data: commentData } = await withTimeout(
        supabase
          .from('comments')
          .select('*, profiles!author_id(nickname, email)')
          .eq('record_id', id)
          .order('created_at', { ascending: true }),
        15000
      )
      setComments(commentData || [])
    } catch (err) {
      console.error('Failed to fetch record:', err)
      // If fetchError wasn't already set to 'not_found', set it to 'network'
      setFetchError(prev => prev || 'network')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRecord()
  }, [fetchRecord])

  // IntersectionObserver for carousel dot indicators
  useEffect(() => {
    const container = carouselRef.current
    if (!container || media.length <= 1) return

    const images = container.querySelectorAll('[data-carousel-item]')
    if (images.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index)
            setActiveImageIndex(idx)
          }
        })
      },
      {
        root: container,
        threshold: 0.6,
      }
    )

    images.forEach(img => observer.observe(img))
    return () => observer.disconnect()
  }, [media])

  const handleToggleLike = async () => {
    const next = !isLiked
    setIsLiked(next)
    try {
      if (next) {
        await db.appSettings.put({ key: `liked-${id}`, value: true })
      } else {
        await db.appSettings.delete(`liked-${id}`)
      }
    } catch (e) {
      console.warn('Failed to persist like:', e)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || submittingComment) return
    setSubmittingComment(true)
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('comments')
          .insert({
            record_id: id,
            author_id: user.id,
            content: commentText.trim(),
          })
          .select('*, profiles!author_id(nickname, email)')
          .single(),
        15000
      )

      if (error) throw error
      setComments(prev => [...prev, data])
      setCommentText('')
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await withTimeout(
        supabase
          .from('records')
          .update({ is_deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', id),
        15000
      )
      setShowDeleteModal(false)
      navigate('/feed')
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareTitle = record?.title || '查看记录'
    const shareText = record?.content?.slice(0, 100) || ''

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setShareToast('链接已复制')
        setTimeout(() => setShareToast(''), 2000)
      }
    } catch (err) {
      // User cancelled share or clipboard failed
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareUrl)
          setShareToast('链接已复制')
          setTimeout(() => setShareToast(''), 2000)
        } catch {
          console.error('Share failed:', err)
        }
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-dvh bg-white dark:bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-apricot-400 animate-spin" />
      </div>
    )
  }

  // Error states
  if (fetchError === 'not_found' || (!record && !fetchError)) {
    return (
      <div className="min-h-dvh bg-white dark:bg-dark-bg flex flex-col items-center justify-center">
        <p className="text-milk-500 dark:text-milk-400">记录不存在</p>
        <button onClick={() => navigate('/feed')} className="mt-4 text-apricot-500 text-sm">返回</button>
      </div>
    )
  }

  if (fetchError === 'network' && !record) {
    return (
      <div className="min-h-dvh bg-white dark:bg-dark-bg flex flex-col items-center justify-center px-6">
        <AlertCircle className="w-12 h-12 text-tulip-400 mb-3" />
        <p className="text-milk-700 dark:text-milk-300 text-center mb-1">加载失败</p>
        <p className="text-sm text-milk-500 dark:text-milk-400 text-center mb-5">网络连接异常，请稍后重试</p>
        <button
          onClick={fetchRecord}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-apricot-400 text-white text-sm font-medium active:scale-95 transition-transform"
        >
          <RefreshCw className="w-4 h-4" />
          重新加载
        </button>
      </div>
    )
  }

  if (!record) return null

  const authorName = record.profiles?.nickname || record.profiles?.email?.split('@')[0] || 'Unknown'
  const authorInitial = authorName[0]?.toUpperCase() || '?'
  const hasImages = media.length > 0

  return (
    <div className="min-h-dvh bg-white dark:bg-dark-bg transition-theme pb-20">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-top">
        <div className={cn(
          'flex items-center justify-between h-12 px-4',
          hasImages
            ? 'bg-gradient-to-b from-black/30 to-transparent'
            : 'bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-milk-200/50 dark:border-dark-border/50'
        )}>
          <button
            onClick={() => navigate(-1)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-sm',
              hasImages
                ? 'bg-black/20'
                : 'bg-milk-100 dark:bg-dark-card'
            )}
          >
            <ArrowLeft className={cn('w-5 h-5', hasImages ? 'text-white' : 'text-milk-800 dark:text-milk-200')} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-sm',
                hasImages
                  ? 'bg-black/20'
                  : 'bg-milk-100 dark:bg-dark-card'
              )}
            >
              <Share2 className={cn('w-4 h-4', hasImages ? 'text-white' : 'text-milk-800 dark:text-milk-200')} />
            </button>
            {record.author_id === user?.id && (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-sm',
                  hasImages
                    ? 'bg-black/20'
                    : 'bg-milk-100 dark:bg-dark-card'
                )}
              >
                <MoreHorizontal className={cn('w-4 h-4', hasImages ? 'text-white' : 'text-milk-800 dark:text-milk-200')} />
              </button>
            )}
          </div>
        </div>
        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-12 right-4 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-milk-200 dark:border-dark-border overflow-hidden z-50">
            <button
              onClick={() => { setShowMenu(false); setShowDeleteModal(true) }}
              className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-milk-50 dark:hover:bg-dark-border w-full"
            >
              <Trash2 className="w-4 h-4" />
              删除记录
            </button>
          </div>
        )}
      </header>

      {/* Share toast */}
      {shareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-dark-card/90 text-white text-sm shadow-lg animate-fade-in">
          {shareToast}
        </div>
      )}

      {/* Image carousel */}
      {hasImages && (
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory] no-scrollbar"
          >
            {media.map((item, i) => {
              const imgUrl = item.compressed_url || item.original_url
              return (
                <div
                  key={item.id || i}
                  data-carousel-item
                  data-index={i}
                  className="w-full flex-shrink-0 [scroll-snap-align:start]"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={`${record.title || '图片'} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === activeImageIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'relative bg-white dark:bg-dark-bg px-5 pt-6 pb-8',
        hasImages && '-mt-6 rounded-t-3xl'
      )}>
        {/* Author & date */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apricot-300 to-tulip-300 flex items-center justify-center text-white text-sm font-medium">
            {authorInitial}
          </div>
          <div>
            <span className="text-sm font-medium text-milk-900 dark:text-milk-100">
              {authorName}
            </span>
            <p className="text-xs text-milk-500 dark:text-milk-400">
              {formatDate(record.created_at)}
            </p>
          </div>
        </div>

        {/* Title */}
        {record.title && (
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100 mb-3">
            {record.title}
          </h1>
        )}

        {/* Content */}
        {record.content && (
          <p className="text-base text-milk-700 dark:text-milk-300 leading-relaxed mb-4 whitespace-pre-wrap">
            {record.content}
          </p>
        )}

        {/* Tags */}
        {record.custom_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {record.custom_tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-apricot-50 dark:bg-dark-card text-apricot-600 dark:text-apricot-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {record.location_name && (
          <div className="flex items-center gap-1 text-sm text-milk-500 dark:text-milk-400 mb-6">
            <MapPin className="w-3.5 h-3.5" />
            {record.location_name}
          </div>
        )}

        {/* Interaction bar */}
        <div className="flex items-center gap-6 py-4 border-t border-b border-milk-200 dark:border-dark-border">
          <button
            onClick={handleToggleLike}
            className="flex items-center gap-1.5"
          >
            <Heart className={cn('w-5 h-5 transition-colors', isLiked ? 'text-tulip-500 fill-tulip-500' : 'text-milk-500')} />
            <span className="text-sm text-milk-600 dark:text-milk-400">喜欢</span>
          </button>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5 text-milk-500" />
            <span className="text-sm text-milk-600 dark:text-milk-400">{comments.length} 评论</span>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium text-milk-700 dark:text-milk-300">
            他说 / 她说
          </h3>
          {comments.length === 0 && (
            <p className="text-sm text-milk-400 dark:text-milk-500">还没有评论，说点什么吧</p>
          )}
          {comments.map(comment => {
            const cAuthor = comment.profiles?.nickname || comment.profiles?.email?.split('@')[0] || '?'
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apricot-200 to-tulip-200 flex items-center justify-center text-xs font-medium text-milk-700 flex-shrink-0">
                  {cAuthor[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-milk-800 dark:text-milk-200">
                      {cAuthor}
                    </span>
                    <span className="text-xs text-milk-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-milk-600 dark:text-milk-400 mt-0.5">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky comment input */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-xl border-t border-milk-200 dark:border-dark-border safe-bottom">
        <div className="flex items-center gap-3 px-5 py-3">
          <input
            type="text"
            placeholder="说点什么..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            className="flex-1 h-10 px-4 rounded-full bg-milk-100 dark:bg-dark-card text-sm text-milk-800 dark:text-milk-200 placeholder:text-milk-400 focus:outline-none focus:ring-2 focus:ring-apricot-300"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || submittingComment}
            className="px-4 h-10 rounded-full bg-apricot-400 text-white text-sm font-medium active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1"
          >
            {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-2xl p-6 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-milk-200 dark:bg-dark-border rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-milk-900 dark:text-milk-100">
                  删除记录
                </h3>
                <p className="text-sm text-milk-500 dark:text-milk-400">
                  确定要删除这条记录吗？可在回收站中恢复。
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-milk-200 dark:border-dark-border text-sm text-milk-600 dark:text-milk-400 active:scale-95 transition-transform"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    确认删除
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
