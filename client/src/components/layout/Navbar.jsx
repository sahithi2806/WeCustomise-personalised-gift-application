import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard, Package, Gift, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import BrandLogo from '../BrandLogo'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
    setDropOpen(false)
    setMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(236,72,153,0.45),rgba(245,158,11,0.45),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <BrandLogo compact />

          <nav className="hidden md:flex items-center rounded-full border border-white/70 bg-white/75 p-1 shadow-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#1f4e79_0%,#ec4899_100%)] text-white shadow-[0_10px_20px_rgba(31,78,121,0.22)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                <Sparkles size={14} />
                Design live on products
              </div>
            )}

            {user && (
              <Link to="/cart" className="relative rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-50">
                <ShoppingCart size={20} className="text-slate-600" />
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#1f4e79_0%,#ec4899_100%)] px-1 text-xs font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f4e79_0%,#ec4899_100%)] text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,78,121,0.22)]">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="max-w-[120px] truncate text-sm font-semibold text-slate-700">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{isAdmin ? 'Admin' : 'Customer'}</p>
                  </div>
                </button>

                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                    <div className="absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/92 py-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur">
                      <div className="border-b border-slate-100 px-5 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropOpen(false)} className="flex w-full items-center gap-3 px-5 py-3 text-sm text-slate-700 transition hover:bg-brand-50">
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/orders" onClick={() => setDropOpen(false)} className="flex w-full items-center gap-3 px-5 py-3 text-sm text-slate-700 transition hover:bg-brand-50">
                        <Package size={16} /> My Orders
                      </Link>
                      <Link to="/gifts" onClick={() => setDropOpen(false)} className="flex w-full items-center gap-3 px-5 py-3 text-sm text-slate-700 transition hover:bg-brand-50">
                        <Gift size={16} /> Gift Scheduler
                      </Link>
                      <Link to="/cart" onClick={() => setDropOpen(false)} className="flex w-full items-center gap-3 px-5 py-3 text-sm text-slate-700 transition hover:bg-brand-50">
                        <ShoppingCart size={16} /> Cart
                        {count > 0 && <span className="ml-auto badge bg-brand-50 text-brand-700">{count}</span>}
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-5 py-3 text-sm text-rose-600 transition hover:bg-rose-50">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link to="/cart" className="relative rounded-xl p-2 transition hover:bg-slate-100">
                <ShoppingCart size={20} className="text-slate-600" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#1f4e79_0%,#ec4899_100%)] px-1 text-xs font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setMenuOpen((open) => !open)} className="rounded-xl p-2 transition hover:bg-slate-100">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/70 bg-white/92 px-4 py-4 backdrop-blur md:hidden">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {user ? (
              <>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">{user.email}</div>
                {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50">Admin Dashboard</Link>}
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50">My Orders</Link>
                <Link to="/gifts" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50">Gift Scheduler</Link>
                <button onClick={handleLogout} className="mt-2 block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">Logout</button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-outline text-center text-sm py-3">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm py-3">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
