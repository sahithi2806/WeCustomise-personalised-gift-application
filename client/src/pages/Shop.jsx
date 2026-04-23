import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Paintbrush } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [total, setTotal]               = useState(0)
  const [pages, setPages]               = useState(1)

  const category     = searchParams.get('category') || ''
  const search       = searchParams.get('search') || ''
  const customisable = searchParams.get('customisable') || ''
  const page         = parseInt(searchParams.get('page') || '1')

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page') // reset pagination on filter change
    setSearchParams(next)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (category)     params.set('category', category)
      if (search)       params.set('search', search)
      if (customisable) params.set('customisable', customisable)
      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products)
      setTotal(data.total)
      setPages(data.pages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [category, search, customisable, page])

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories))
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const hasFilters = category || search || customisable

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop All Products</h1>
        <p className="text-gray-500 text-sm mt-1">{total} products found</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)}
            onBlur={e => setParam('search', e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={e => setParam('category', e.target.value)}
          className="input w-auto min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Customisable toggle */}
        <button
          onClick={() => setParam('customisable', customisable ? '' : 'true')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
            customisable
              ? 'bg-brand-700 text-white border-brand-700'
              : 'bg-white text-gray-600 border-gray-300 hover:border-brand-700 hover:text-brand-700'
          }`}
        >
          <Paintbrush size={15} /> Customisable
        </button>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-3"
          >
            <X size={15} /> Clear
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {category && (
            <span className="badge bg-brand-50 text-brand-700 flex items-center gap-1 pr-1">
              {categories.find(c => c.slug === category)?.name || category}
              <button onClick={() => setParam('category', '')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {search && (
            <span className="badge bg-brand-50 text-brand-700 flex items-center gap-1 pr-1">
              "{search}"
              <button onClick={() => setParam('search', '')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {customisable && (
            <span className="badge bg-brand-50 text-brand-700 flex items-center gap-1 pr-1">
              Customisable only
              <button onClick={() => setParam('customisable', '')} className="ml-1 hover:text-red-500"><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => (
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
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-500 mb-1">No products found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.set('page', i + 1)
                    setSearchParams(next)
                  }}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-brand-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
