import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Paintbrush, Truck, ShieldCheck, Gift, Sparkles } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

const FEATURES = [
  { icon: Paintbrush, title: 'Creative Studio', desc: 'Layer text, color, and artwork, then see the design sitting on the product itself.' },
  { icon: Truck, title: 'Delivery That Fits', desc: 'Fast shipping now pairs with scheduled gift delivery when timing matters.' },
  { icon: Gift, title: 'Gift-Ready Moments', desc: 'Plan birthdays, anniversaries, and celebrations right during purchase.' },
  { icon: ShieldCheck, title: 'Safe Checkout', desc: 'UPI, card, and COD all work through a cleaner, trust-building checkout flow.' },
]

const heroImages = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
  'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500',
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500',
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/products?limit=8'), api.get('/products/categories')])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data.products)
        setCategories(categoriesRes.data.categories)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1f4e79_0%,#ec4899_48%,#f59e0b_100%)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_24%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
              <Sparkles size={14} /> Make gifting look alive
            </span>
            <h1 className="max-w-3xl text-4xl md:text-6xl font-black leading-[0.95] tracking-tight">
              Vibrant custom gifts that preview directly on the product.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/82">
              Personalise shirts, mugs, posters, and cases with a bolder storefront, live product previews, and scheduled gift delivery built right into checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 font-bold text-brand-700 transition hover:-translate-y-0.5 hover:bg-amber-200">
                Explore Products <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="inline-flex items-center rounded-xl border-2 border-white/80 px-7 py-3 font-bold text-white transition hover:bg-white/10">
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {heroImages.map((src, index) => (
              <div
                key={src}
                className={`overflow-hidden rounded-[1.8rem] border border-white/30 bg-white/10 shadow-[0_20px_45px_rgba(15,23,42,0.2)] ${index % 2 === 1 ? 'translate-y-6' : ''}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 bg-white/80">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-orange-100">
                <Icon size={22} className="text-brand-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Shop by Category</h2>
              <p className="mt-1 text-sm text-slate-500">Jump into the format that fits the moment.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/shop?category=${category.slug}`} className="card group">
                <div className="aspect-square overflow-hidden bg-slate-100">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full bg-brand-50" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-bold text-slate-900 transition group-hover:text-brand-700">{category.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{category._count?.products ?? 0} products</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Featured Products</h2>
            <p className="mt-1 text-sm text-slate-500">A brighter mix of customisable crowd-pleasers.</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:gap-3 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded bg-gray-200 w-1/2" />
                  <div className="h-4 rounded bg-gray-200 w-3/4" />
                  <div className="h-4 rounded bg-gray-200 w-1/4 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f97316_0%,#ec4899_45%,#1f4e79_100%)] px-8 py-12 text-center text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
            <h2 className="text-3xl font-black tracking-tight">Ready to build a gift that feels unmistakably yours?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/80">
              Start personalising now, schedule the delivery when you need it, and let the product preview do the convincing.
            </p>
            <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-brand-700 transition hover:-translate-y-0.5 hover:bg-amber-200">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
