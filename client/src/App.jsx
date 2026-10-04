import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Route-level splitting: AdminDashboard and Orders in particular are never
// needed by most sessions, and shipping them in the entry chunk cost every
// visitor ~354KB up front.
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Gifts = lazy(() => import('./pages/Gifts'))
const Login = lazy(() => import('./pages/Login'))
const Orders = lazy(() => import('./pages/Orders'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function PageSpinner({ full = true }) {
  return (
    <div className={full ? 'min-h-screen flex items-center justify-center' : 'py-20 flex items-center justify-center'}>
      <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageSpinner />
  // Pass the attempted location so Login can return the user to it. Without this
  // state, logging in after being bounced always landed on "/" instead.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
      {/* Public */}
      <Route path="/"          element={<Layout><Home /></Layout>} />
      <Route path="/shop"      element={<Layout><Shop /></Layout>} />
      <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />

      {/* Protected */}
      <Route path="/cart" element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
      <Route path="/gifts" element={<ProtectedRoute><Layout><Gifts /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '12px', fontFamily: 'Manrope, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#1F4E79', secondary: '#fff' } },
            }}
          />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
