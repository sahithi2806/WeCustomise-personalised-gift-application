import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Paintbrush, Sparkles } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const customisable = searchParams.get('customisable') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      if (customisable) params.set('customisable', customisable)
      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products)
      setTotal(data.total)
      setPages(data.pages)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [category, search, customisable, page])

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories))
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const hasFilters = category || search || customisable

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(31,78,121,0.12)_0%,rgba(236,72,153,0.1)_48%,rgba(245,158,11,0.12)_100%)] px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.6),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.4),transparent_22%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 shadow-sm">
              <Sparkles size={14} /> Build something gift-worthy
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Shop a brighter collection of custom pieces</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Filter the catalogue, jump into customisable products, and pick items that now preview your design directly on the product surface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Products</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{total}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Pages</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{pages}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Mode</p>
              <p className="mt-1 text-sm font-bold text-brand-700">{customisable ? 'Custom only' : 'All items'}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Category</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{categories.find((item) => item.slug === category)?.name || 'Everything'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 card p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, gift ideas, colors..."
              defaultValue={search}
              onKeyDown={(event) => event.key === 'Enter' && setParam('search', event.target.value)}
              onBlur={(event) => setParam('search', event.target.value)}
              className="input pl-11"
            />
          </div>

          <select value={category} onChange={(event) => setParam('category', event.target.value)} className="input lg:w-[220px]">
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </select>

          <button
            onClick={() => setParam('customisable', customisable ? '' : 'true')}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all ${
              customisable
                ? 'border-brand-700 bg-[linear-gradient(135deg,#1f4e79_0%,#ec4899_100%)] text-white shadow-[0_14px_30px_rgba(31,78,121,0.2)]'
                : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            <Paintbrush size={15} /> Customisable
          </button>

          {hasFilters && (
            <button onClick={() => setSearchParams({})} className="inline-flex items-center justify-center gap-2 px-3 text-sm font-medium text-rose-500 transition hover:text-rose-700">
              <X size={15} /> Clear
            </button>
          )}
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {category && (
              <span className="badge bg-brand-50 text-brand-700 gap-2 pr-2">
                {categories.find((item) => item.slug === category)?.name || category}
                <button onClick={() => setParam('category', '')} className="rounded-full p-0.5 transition hover:bg-white hover:text-rose-500"><X size={10} /></button>
              </span>
            )}
            {search && (
              <span className="badge bg-orange-50 text-orange-700 gap-2 pr-2">
                "{search}"
                <button onClick={() => setParam('search', '')} className="rounded-full p-0.5 transition hover:bg-white hover:text-rose-500"><X size={10} /></button>
              </span>
            )}
            {customisable && (
              <span className="badge bg-fuchsia-50 text-fuchsia-700 gap-2 pr-2">
                Customisable only
                <button onClick={() => setParam('customisable', '')} className="rounded-full p-0.5 transition hover:bg-white hover:text-rose-500"><X size={10} /></button>
              </span>
            )}
          </div>
        )}
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="aspect-square bg-slate-200" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-1/4 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card py-20 text-center">
            <SlidersHorizontal size={40} className="mx-auto mb-3 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-500 mb-1">No products found</h3>
            <p className="text-sm text-slate-400">Try a different filter mix or search phrase.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>

            {pages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {[...Array(pages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.set('page', index + 1)
                      setSearchParams(next)
                    }}
                    className={`h-11 w-11 rounded-2xl text-sm font-bold transition-all ${
                      page === index + 1
                        ? 'bg-[linear-gradient(135deg,#1f4e79_0%,#ec4899_100%)] text-white shadow-[0_14px_30px_rgba(31,78,121,0.2)]'
                        : 'border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-brand-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
