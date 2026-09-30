/**
 * TwoLyp App Constants
 */

// Fixed categories for content organization
export const CATEGORIES = [
  { id: 'travel', label: '旅行', icon: 'Plane', emoji: '✈️' },
  { id: 'food', label: '美食', icon: 'UtensilsCrossed', emoji: '🍽️' },
  { id: 'activity', label: '活动', icon: 'Gamepad2', emoji: '🎮' },
  { id: 'photo', label: '照片', icon: 'Camera', emoji: '📷' },
]

// Media layout types based on count
export const MEDIA_LAYOUTS = {
  SINGLE: 'single',       // 1 photo
  CAROUSEL: 'carousel',   // 2-3 photos
  GRID_4: 'grid4',        // 4 photos
  ADAPTIVE: 'adaptive',   // 5-8 photos
  NINE_GRID: 'nineGrid',  // 9+ photos
}

// Get layout type based on media count
export function getMediaLayout(count) {
  if (count === 1) return MEDIA_LAYOUTS.SINGLE
  if (count <= 3) return MEDIA_LAYOUTS.CAROUSEL
  if (count === 4) return MEDIA_LAYOUTS.GRID_4
  if (count <= 8) return MEDIA_LAYOUTS.ADAPTIVE
  return MEDIA_LAYOUTS.NINE_GRID
}

// Image compression settings
export const IMAGE_COMPRESS = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
}

// Video compression settings
export const VIDEO_COMPRESS = {
  maxWidth: 1280,
  maxHeight: 720,
  bitrate: 2_000_000, // 2Mbps ~ 15-30MB/min
}

// Recycle bin retention period (days)
export const RECYCLE_RETENTION_DAYS = 31

// Login timeout for 2FA trigger (days)
export const LOGIN_TIMEOUT_DAYS = 3

// Default card layout templates
export const LAYOUT_TEMPLATES = [
  { id: 'magazine', label: '杂志风', description: '大图+文字交错' },
  { id: 'minimal', label: '极简风', description: '留白为主' },
  { id: 'journal', label: '手账风', description: '图文自由排版' },
]

// App routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  FEED: '/feed',
  CREATE: '/create',
  RECORD: '/record/:id',
  MAP: '/map',
  ANNIVERSARY: '/anniversary',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  JOURNEY: '/journey/:id',
  ANNUAL_REPORT: '/annual-report',
  RECYCLE_BIN: '/recycle-bin',
  DATA_EXPORT: '/data-export',
}
