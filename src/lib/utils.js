import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 * Usage: cn('px-4 py-2', isActive && 'bg-apricot-400', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date, locale = 'zh-CN') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(date))
}

/**
 * Format relative time (e.g., "3天前", "刚刚")
 */
export function formatRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now - target
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`
  return formatDate(date)
}

/**
 * Calculate days together
 */
export function daysTogether(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  return Math.floor((now - start) / 86400000)
}

/**
 * Generate unique ID
 */
export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() :
    Date.now().toString(36) + Math.random().toString(36).slice(2)
}
