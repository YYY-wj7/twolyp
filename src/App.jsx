import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth, db } from './contexts/AppContext'
import { DBProvider } from './contexts/AppContext'

// Layouts
import AppLayout from './components/AppLayout'

// Pages
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import FeedPage from './pages/FeedPage'
import CreatePage from './pages/CreatePage'
import RecordDetailPage from './pages/RecordDetailPage'
import MapPage from './pages/MapPage'
import AnniversaryPage from './pages/AnniversaryPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import JourneyPage from './pages/JourneyPage'
import AnnualReportPage from './pages/AnnualReportPage'
import RecycleBinPage from './pages/RecycleBinPage'
import TravelWishlistPage from './pages/TravelWishlistPage'
import PeriodTrackerPage from './pages/PeriodTrackerPage'

/**
 * Protected route wrapper — redirects to login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-milk-50 dark:bg-dark-bg">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-apricot-200 dark:bg-apricot-800" />
          <p className="text-sm text-milk-600 dark:text-milk-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

/**
 * Guest route — redirects to appropriate page if already logged in
 */
function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) {
    const target = window.__twoLypRedirectTo || '/feed'
    window.__twoLypRedirectTo = null
    return <Navigate to={target} replace />
  }
  return children
}

/**
 * Smart redirect for root and catch-all routes.
 * Checks auth state and redirect flag to route correctly.
 */
function SmartRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const target = window.__twoLypRedirectTo || '/feed'
  window.__twoLypRedirectTo = null
  return <Navigate to={target} replace />
}

export default function App() {
  // Apply saved theme on app startup
  useEffect(() => {
    db.appSettings.get('theme-preference').then(entry => {
      const theme = entry?.value || 'system'
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark', 'force-dark')
      } else if (theme === 'light') {
        root.classList.add('force-light')
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark')
        }
      }
    }).catch(() => {})
  }, [])

  return (
    <HashRouter>
      <AuthProvider>
        <DBProvider>
          <div className="tulip-bg" />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              <GuestRoute><LoginPage /></GuestRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute><OnboardingPage /></ProtectedRoute>
            } />

            {/* Protected routes with bottom nav layout */}
            <Route element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/wishlist" element={<TravelWishlistPage />} />
              <Route path="/anniversary" element={<AnniversaryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/recycle-bin" element={<RecycleBinPage />} />
            </Route>

            {/* Full-screen routes (no bottom nav) */}
            <Route path="/create" element={
              <ProtectedRoute><CreatePage /></ProtectedRoute>
            } />
            <Route path="/period-tracker" element={
              <ProtectedRoute><PeriodTrackerPage /></ProtectedRoute>
            } />
            <Route path="/record/:id" element={
              <ProtectedRoute><RecordDetailPage /></ProtectedRoute>
            } />
            <Route path="/journey" element={
              <ProtectedRoute><JourneyPage /></ProtectedRoute>
            } />
            <Route path="/journey/:id" element={
              <ProtectedRoute><JourneyPage /></ProtectedRoute>
            } />
            <Route path="/annual-report" element={
              <ProtectedRoute><AnnualReportPage /></ProtectedRoute>
            } />

            {/* Default redirect — check if user needs onboarding */}
            <Route path="/" element={<SmartRedirect />} />
            <Route path="*" element={<SmartRedirect />} />
          </Routes>
        </DBProvider>
      </AuthProvider>
    </HashRouter>
  )
}
