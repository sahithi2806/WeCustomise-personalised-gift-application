import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard, Package, User, Gift } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WC</span>
            </div>
            <span className="text-xl font-bold text-brand-700 tracking-tight">WeCustomise</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-brand-700 hover:bg-gray-50'}`
                }>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon */}
            {user && (
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <ShoppingCart size={20} className="text-gray-600" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-700 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setDropOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/orders" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/gifts" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                        <Gift size={15} /> Gift Scheduler
                      </Link>
                      <Link to="/cart" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                        <ShoppingCart size={15} /> Cart {count > 0 && <span className="ml-auto badge bg-brand-50 text-brand-700">{count}</span>}
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <LogOut size={15} /> Logout
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

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link to="/cart" className="relative p-2">
                <ShoppingCart size={20} className="text-gray-600" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-700 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setMenuOpen(o => !o)} className="p-2 rounded-lg hover:bg-gray-100">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600'}`
              }>
              {l.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-xs text-gray-500">{user.email}</div>
                {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700">Admin Dashboard</Link>}
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700">My Orders</Link>
                <Link to="/gifts" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700">Gift Scheduler</Link>
                <button onClick={handleLogout} className="block px-3 py-2 text-sm text-red-600 w-full text-left">Logout</button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-outline text-center text-sm py-2">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
