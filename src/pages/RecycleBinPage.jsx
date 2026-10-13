import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trash2, Leaf } from 'lucide-react'
import { cn, withTimeout } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { deleteMediaFiles } from '../lib/storage'

export default function RecycleBinPage() {
  const navigate = useNavigate()
  const { gardenId } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!gardenId) {
      setLoading(false)
      return
    }
    fetchDeleted()
  }, [gardenId])

  async function fetchDeleted() {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('records')
          .select('id, title, deleted_at, created_at')
          .eq('garden_id', gardenId)
          .eq('is_deleted', true)
          .order('deleted_at', { ascending: false }),
        15000,
        '加载回收站'
      )
      if (error) throw error
      if (data) setItems(data)
    } catch (e) {
      console.error('Failed to fetch deleted records:', e)
      setError(e.message || '加载回收站失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleRestore(id) {
    setActionLoading(id)
    setActionError('')
    try {
      const { error } = await withTimeout(
        supabase
          .from('records')
          .update({ is_deleted: false, deleted_at: null })
          .eq('id', id),
        15000,
        '恢复记录'
      )
      if (error) throw error
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (e) {
      console.error('Failed to restore:', e)
      setActionError(e.message || '恢复失败，请稍后重试')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeletePermanently(id) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    setActionLoading(id)
    setActionError('')
    try {
      // 1. Query associated media to clean up storage files
      const { data: mediaItems } = await withTimeout(
        supabase
          .from('media')
          .select('original_url, compressed_url, thumbnail_url')
          .eq('record_id', id),
        15000,
        '查询媒体文件'
      )

      // 2. Extract storage paths from URLs and delete from storage
      if (mediaItems?.length > 0) {
        const paths = []
        const marker = '/storage/v1/object/public/media/'
        for (const m of mediaItems) {
          for (const url of [m.original_url, m.compressed_url, m.thumbnail_url]) {
            if (url) {
              const idx = url.indexOf(marker)
              if (idx !== -1) {
                const p = url.slice(idx + marker.length)
                if (p && !paths.includes(p)) paths.push(p)
              }
            }
          }
        }
        if (paths.length > 0) {
          await deleteMediaFiles(paths)
        }

        // 3. Delete media rows (also handled by ON DELETE CASCADE, but explicit is safer)
        await withTimeout(
          supabase
            .from('media')
            .delete()
            .eq('record_id', id),
          15000,
          '删除媒体记录'
        )
      }

      // 4. Delete the record
      const { error } = await withTimeout(
        supabase
          .from('records')
          .delete()
          .eq('id', id),
        15000,
        '永久删除记录'
      )
      if (error) throw error
      setItems((prev) => prev.filter((item) => item.id !== id))
      setConfirmDeleteId(null)
    } catch (e) {
      console.error('Failed to delete:', e)
      setActionError(e.message || '删除失败，请稍后重试')
    } finally {
      setActionLoading(null)
    }
  }

  function daysRemaining(deletedAt) {
    const deleted = new Date(deletedAt)
    const expires = new Date(deleted.getTime() + 31 * 86400000)
    const remaining = Math.ceil((expires - new Date()) / 86400000)
    return Math.max(0, remaining)
  }

  return (
    <div className="relative z-10 animate-page-enter">
      <header className="sticky top-0 z-40 glass dark:glass-dark safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            回收站
          </h1>
        </div>
      </header>

      <div className="px-4 mt-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-apricot-300 border-t-apricot-500 rounded-full animate-spin" />
              <span className="text-sm text-milk-500 dark:text-milk-400">加载中...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-tulip-50 dark:bg-dark-card flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-tulip-400" />
            </div>
            <p className="text-sm text-tulip-500 dark:text-tulip-400">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-apricot-50 dark:bg-dark-card flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-apricot-300" />
            </div>
            <h3 className="text-base font-semibold text-milk-800 dark:text-milk-200">回收站是空的</h3>
            <p className="text-sm text-milk-500 dark:text-milk-400 mt-1">删除的记录会出现在这里</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-milk-500 dark:text-milk-400 mb-3 px-1">
              删除的记录将在 31 天后永久清除
            </p>
            {actionError && (
              <div className="p-2.5 rounded-xl bg-tulip-50 dark:bg-tulip-900/20 border border-tulip-100 dark:border-tulip-800/30">
                <p className="text-xs text-tulip-500 dark:text-tulip-400">{actionError}</p>
              </div>
            )}
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card animate-fade-in"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-milk-100 dark:bg-dark-border flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-milk-400 dark:text-milk-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-milk-900 dark:text-milk-100 line-clamp-1">
                    {item.title || '无标题'}
                  </span>
                  <p className="text-xs text-milk-400 mt-0.5">
                    还剩 {daysRemaining(item.deleted_at)} 天自动清除
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRestore(item.id)}
                    disabled={actionLoading === item.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-apricot-50 dark:bg-dark-border text-xs font-medium text-apricot-500 dark:text-apricot-400 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    <RotateCcw className={cn("w-3.5 h-3.5", actionLoading === item.id && "animate-spin")} />
                    恢复
                  </button>
                  <button
                    onClick={() => handleDeletePermanently(item.id)}
                    disabled={actionLoading === item.id}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-50",
                      confirmDeleteId === item.id
                        ? "bg-tulip-500 text-white"
                        : "bg-tulip-50 dark:bg-tulip-900/20 text-tulip-500 dark:text-tulip-400"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmDeleteId === item.id ? '确认？' : '删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
