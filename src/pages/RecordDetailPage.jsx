import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, MapPin, Share2, MoreHorizontal, Trash2, Send, Loader2 } from 'lucide-react'
import { cn, formatDate } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

export default function RecordDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, gardenId } = useAuth()

  const [record, setRecord] = useState(null)
  const [media, setMedia] = useState([])
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    async function fetchRecord() {
      if (!id) return
      setLoading(true)
      try {
        // Fetch record
        const { data: rec, error } = await supabase
          .from('records')
          .select('*, profiles!author_id(nickname, email, avatar_url)')
          .eq('id', id)
          .single()

        if (error) throw error
        setRecord(rec)

        // Fetch media
        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('record_id', id)
          .order('sort_order')
        setMedia(mediaData || [])

        // Fetch comments with author info
        const { data: commentData } = await supabase
          .from('comments')
          .select('*, profiles!author_id(nickname, email)')
          .eq('record_id', id)
          .order('created_at', { ascending: true })
        setComments(commentData || [])
      } catch (err) {
        console.error('Failed to fetch record:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecord()
  }, [id])

  const handleAddComment = async () => {
    if (!commentText.trim() || submittingComment) return
    setSubmittingComment(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          record_id: id,
          author_id: user.id,
          content: commentText.trim(),
        })
        .select('*, profiles!author_id(nickname, email)')
        .single()

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
    if (!confirm('确定要删除这条记录吗？可在回收站中恢复。')) return
    try {
      await supabase
        .from('records')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)
      navigate('/feed')
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-white dark:bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-apricot-400 animate-spin" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-dvh bg-white dark:bg-dark-bg flex flex-col items-center justify-center">
        <p className="text-milk-500 dark:text-milk-400">记录不存在</p>
        <button onClick={() => navigate('/feed')} className="mt-4 text-apricot-500 text-sm">返回</button>
      </div>
    )
  }

  const authorName = record.profiles?.nickname || record.profiles?.email?.split('@')[0] || 'Unknown'
  const authorInitial = authorName[0]?.toUpperCase() || '?'
  const coverImage = media[0]?.compressed_url || media[0]?.original_url || null

  return (
    <div className="min-h-dvh bg-white dark:bg-dark-bg transition-theme">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-top">
        <div className="flex items-center justify-between h-12 px-4 bg-gradient-to-b from-black/30 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            {record.author_id === user?.id && (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
              >
                <MoreHorizontal className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-12 right-4 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-milk-200 dark:border-dark-border overflow-hidden z-50">
            <button
              onClick={() => { setShowMenu(false); handleDelete() }}
              className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-milk-50 dark:hover:bg-dark-border w-full"
            >
              <Trash2 className="w-4 h-4" />
              删除记录
            </button>
          </div>
        )}
      </header>

      {/* Hero image */}
      {coverImage && (
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={coverImage} alt={record.title} className="w-full h-full object-cover" />
          </div>
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === 0 ? 'bg-white w-4' : 'bg-white/50'
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
        coverImage && '-mt-6 rounded-t-3xl'
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
            onClick={() => setIsLiked(!isLiked)}
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

        {/* Comment input */}
        <div className="mt-6 flex items-center gap-3">
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
    </div>
  )
}
