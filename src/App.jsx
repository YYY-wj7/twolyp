import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { AuthProvider, useAuth, db } from './contexts/AppContext'
import { DBProvider } from './contexts/AppContext'
import SplashScreen from './components/SplashScreen'

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
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-milk-50 to-apricot-50 dark:from-dark-bg dark:to-dark-card">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-400 to-apricot-500 flex items-center justify-center shadow-lg shadow-coral-400/20 animate-pulse">
            <svg viewBox="0 0 96 96" className="w-8 h-8" fill="none">
              <path d="M48 19c-5.8 0-11 5.7-13.2 13.7C28.9 26.4 22 25.1 17 28.8c.6 22.8 10.8 36.4 31 40.7 20.2-4.3 30.4-17.9 31-40.7-5-3.7-11.9-2.4-17.8 3.9C59 24.7 53.8 19 48 19Z" fill="white" />
            </svg>
          </div>
          <p className="text-sm text-milk-600 dark:text-milk-400 font-medium">加载中...</p>
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
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashDone = useCallback(() => setShowSplash(false), [])

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
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
    </HashRouter>
  )
}
