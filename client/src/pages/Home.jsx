import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Paintbrush, Truck, ShieldCheck, Gift } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

const FEATURES = [
  { icon: Paintbrush, title: 'Fully Customisable', desc: 'Add text, colours, and your own images to make it truly unique.' },
  { icon: Truck,      title: 'Fast Delivery',      desc: 'Delivered to your doorstep in 3–5 business days across India.' },
  { icon: Gift,       title: 'Gift Scheduling',    desc: 'Schedule gifts for occasions and we\'ll remind you in advance.' },
  { icon: ShieldCheck,title: 'Secure Checkout',   desc: 'Pay via UPI, Card, or COD. 100% safe and encrypted.' },
]

export default function Home() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8'),
      api.get('/products/categories'),
    ]).then(([p, c]) => {
      setProducts(p.data.products)
      setCategories(c.data.categories)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              ✨ Make It Yours
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
              Gifts That Feel<br />
              <span className="text-yellow-300">Perfectly Personal</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-md mx-auto md:mx-0">
              Browse 100+ customisable products. Add your touch — text, colours, photos — and gift something they'll never forget.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/shop" className="bg-white text-brand-700 font-bold px-7 py-3 rounded-xl hover:bg-yellow-300 transition-colors flex items-center gap-2">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="border-2 border-white text-white font-bold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors">
                Create Account
              </Link>
            </div>
          </div>

          {/* Hero image grid */}
          <div className="flex-1 grid grid-cols-2 gap-3 max-w-sm mx-auto md:max-w-none">
            {['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
              'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300',
              'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300',
              'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300',
            ].map((src, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden aspect-square shadow-lg ${i === 1 ? 'mt-6' : ''} ${i === 3 ? 'mt-6' : ''}`}>
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-brand-700" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-500 text-sm mt-1">Find exactly what you're looking for</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group card hover:shadow-md transition-shadow text-center overflow-hidden"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full bg-brand-50" />
                  }
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-800 group-hover:text-brand-700 transition-colors">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat._count?.products ?? 0} products</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ────────────────────────────────────── */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-500 text-sm mt-1">Bestsellers loved by thousands</p>
            </div>
            <Link to="/shop" className="text-brand-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to create something special?</h2>
          <p className="text-blue-100 mb-8">Join thousands of happy customers who've made their gifts unforgettable.</p>
          <Link to="/register" className="bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors inline-flex items-center gap-2">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
