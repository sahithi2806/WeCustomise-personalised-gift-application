import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, ShoppingBag, Paintbrush, ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import CustomisationStudio from '../components/CustomisationStudio'
import toast from 'react-hot-toast'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange?.(n)}
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}>
          <Star size={22} className={`transition-colors ${n <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id }        = useParams()
  const { user }      = useAuth()
  const { addToCart } = useCart()
  const navigate      = useNavigate()

  const [product, setProduct]               = useState(null)
  const [loading, setLoading]               = useState(true)
  const [qty, setQty]                       = useState(1)
  const [adding, setAdding]                 = useState(false)
  const [customiseMode, setCustomiseMode]   = useState(false)
  const [customisation, setCustomisation]   = useState(null)
  const [rating, setRating]                 = useState(0)
  const [comment, setComment]               = useState('')
  const [reviewing, setReviewing]           = useState(false)
  const [canReview, setCanReview]           = useState(false)
  const [reviewHint, setReviewHint]         = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (!user || !id) {
      setCanReview(false)
      setReviewHint('')
      return
    }

    let active = true

    api.get('/orders')
      .then(({ data }) => {
        if (!active) return

        const deliveredOrders = data.orders.filter((order) => order.status === 'DELIVERED')
        const hasDeliveredPurchase = deliveredOrders.some((order) =>
          order.items.some((item) => item.productId === id)
        )

        setCanReview(hasDeliveredPurchase)
        setReviewHint(
          hasDeliveredPurchase
            ? 'You purchased this item and can leave a review.'
            : 'Reviews unlock after this product is delivered.'
        )
      })
      .catch(() => {
        if (!active) return
        setCanReview(false)
        setReviewHint('We could not verify review eligibility right now.')
      })

    return () => {
      active = false
    }
  }, [user, id])

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please log in to add to cart.'); navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, qty, null)
      toast.success(`${product.name} added to cart!`)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not add to cart.')
    } finally { setAdding(false) }
  }

  const handleCustomisedSave = async (customisationData) => {
    if (!user) { toast.error('Please log in.'); navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, qty, customisationData)
      toast.success('Customised product added to cart! 🎨')
      setCustomiseMode(false)
      setCustomisation(customisationData)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not add to cart.')
    } finally { setAdding(false) }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please select a rating.'); return }
    setReviewing(true)
    try {
      const { data } = await api.post('/reviews', { productId: product.id, rating, comment })
      toast.success('Review submitted!')
      setProduct(prev => ({ ...prev, reviews: [data.review, ...prev.reviews.filter(r => r.userId !== user.id)] }))
      setRating(0); setComment('')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to submit review.')
    } finally { setReviewing(false) }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4 pt-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 - i * 10}%` }} />)}
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const avgRating = product.reviews.length
    ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-700">Home</Link><span>/</span>
        <Link to="/shop" className="hover:text-brand-700">Shop</Link><span>/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      {/* Product info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div className="card overflow-hidden aspect-square relative">
          <img
            src={customisation?.snapshot || product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {customisation && (
            <div className="absolute bottom-3 left-3">
              <span className="badge bg-brand-700 text-white flex items-center gap-1 px-3 py-1">
                <Sparkles size={10} /> Your customisation applied
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category?.name}</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(n => <Star key={n} size={15} className={n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}
              </div>
              <span className="text-sm text-gray-500">{avgRating} ({product.reviews.length} reviews)</span>
            </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>

          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-3xl font-bold text-brand-700">₹{product.price.toLocaleString()}</span>
            <span className="text-sm text-gray-400">incl. all taxes</span>
          </div>

          <div className={`flex items-center gap-2 text-sm mb-5 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.stock > 0 ? `In Stock — ${product.stock} available` : 'Out of Stock'}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 text-gray-600"><ChevronLeft size={16} /></button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50 text-gray-600"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            {product.isCustomisable && (
              <button
                onClick={() => {
                  if (!user) { toast.error('Log in to customise'); navigate('/login'); return }
                  setCustomiseMode(m => !m)
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm border-2 transition-all ${
                  customiseMode
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'border-brand-700 text-brand-700 hover:bg-brand-50'
                }`}
              >
                <Paintbrush size={16} />
                {customiseMode ? 'Close Studio' : customisation ? 'Edit Design' : 'Customise This'}
              </button>
            )}
            {!customiseMode && (
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm"
              >
                <ShoppingBag size={16} />
                {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            )}
          </div>

          {customisation && !customiseMode && (
            <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-700">
              <Sparkles size={14} /> Design saved — add to cart to purchase
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
            <Package size={14} className="text-brand-500" /> Free shipping on orders over ₹999
          </div>
        </div>
      </div>

      {/* ── Customisation Studio Panel ── */}
      {customiseMode && product.isCustomisable && (
        <div className="card p-6 mb-10 border-2 border-brand-100 bg-gradient-to-br from-brand-50/50 to-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center shadow-sm">
              <Paintbrush size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customisation Studio</h2>
              <p className="text-xs text-gray-500">Click a layer on the canvas to select it. Drag to reposition.</p>
            </div>
          </div>
          <CustomisationStudio product={product} onSave={handleCustomisedSave} />
        </div>
      )}

      {/* ── Reviews ── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="card p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>
            <div className={`rounded-xl px-4 py-3 mb-4 text-sm ${canReview ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-amber-50 border border-amber-100 text-amber-700'}`}>
              {reviewHint || 'Reviews are available after a delivered purchase.'}
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1.5 block">Your Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..." rows={3} className="input resize-none mb-4" />
            <button type="submit" disabled={reviewing || !canReview} className="btn-primary px-6 py-2 text-sm">
              {reviewing ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
        {product.reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Star size={32} className="mx-auto mb-2" />
            <p className="text-sm">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews.map(r => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                      {r.user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="font-medium text-sm">{r.user?.name ?? 'Customer'}</span>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => <Star key={n} size={13} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
