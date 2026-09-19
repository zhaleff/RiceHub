import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Submit = lazy(() => import('./pages/Submit'))
const RiceDetail = lazy(() => import('./pages/RiceDetail'))
const Gallery = lazy(() => import('./pages/Gallery'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminQueue = lazy(() => import('./admin/AdminQueue'))
const AdminApproved = lazy(() => import('./admin/AdminApproved'))


function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/about" element={<About />} />
                <Route path="/" element={<Home />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/rice/:slug" element={<RiceDetail />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="queue" element={<AdminQueue />} />
                  <Route path="approved" element={<AdminApproved />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-accent)',
                secondary: 'var(--color-surface)',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
