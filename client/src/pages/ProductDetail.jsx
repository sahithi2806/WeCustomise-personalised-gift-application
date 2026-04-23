import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, ShoppingBag, Paintbrush, ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import CustomisationStudio from '../components/CustomisationStudio'
import ProductPreview from '../components/ProductPreview'
import toast from 'react-hot-toast'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={22}
            className={`transition-colors ${n <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [customiseMode, setCustomiseMode] = useState(false)
  const [customisation, setCustomisation] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [reviewHint, setReviewHint] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get(`/products/${id}`)
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

    api
      .get('/orders')
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
    if (!user) {
      toast.error('Please log in to add to cart.')
      navigate('/login')
      return
    }

    setAdding(true)
    try {
      await addToCart(product.id, qty, customisation || null)
      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not add to cart.')
    } finally {
      setAdding(false)
    }
  }

  const handleCustomisedSave = async (customisationData) => {
    if (!user) {
      toast.error('Please log in.')
      navigate('/login')
      return
    }

    setCustomisation(customisationData)
    setCustomiseMode(false)
    toast.success('Design saved on the product preview.')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!rating) {
      toast.error('Please select a rating.')
      return
    }

    setReviewing(true)
    try {
      const { data } = await api.post('/reviews', { productId: product.id, rating, comment })
      toast.success('Review submitted!')
      setProduct((prev) => ({
        ...prev,
        reviews: [data.review, ...prev.reviews.filter((review) => review.userId !== user.id)],
      }))
      setRating(0)
      setComment('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review.')
    } finally {
      setReviewing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const avgRating = product.reviews.length
    ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-700">Shop</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div className="space-y-4">
          <ProductPreview
            product={product}
            customisation={customisation}
            className="card aspect-square rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-white to-brand-50/60"
            imageClassName="scale-[1.02]"
            showBadge
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-orange-500">Preview</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Design on product</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500">Finish</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Print-ready placement</p>
            </div>
            <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-500">Gifting</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Made for memorable gifts</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <span className="mb-2 inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            {product.category?.name}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">{product.name}</h1>

          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={15}
                    className={n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">{avgRating} ({product.reviews.length} reviews)</span>
            </div>
          )}

          <p className="text-slate-600 text-sm leading-relaxed mb-5">{product.description}</p>

          <div className="mb-5 flex items-end gap-3">
            <span className="text-4xl font-black text-brand-700">Rs. {product.price.toLocaleString()}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">incl. all taxes</span>
          </div>

          <div className={`flex items-center gap-2 text-sm mb-5 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.stock > 0 ? `In Stock - ${product.stock} available` : 'Out of Stock'}
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty((value) => Math.max(1, value - 1))} className="px-3 py-2 hover:bg-gray-50 text-gray-600">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty((value) => Math.min(product.stock, value + 1))} className="px-3 py-2 hover:bg-gray-50 text-gray-600">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {product.isCustomisable && (
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Log in to customise')
                    navigate('/login')
                    return
                  }
                  setCustomiseMode((value) => !value)
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

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm"
            >
              <ShoppingBag size={16} />
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : customisation ? 'Add Custom Design' : 'Add to Cart'}
            </button>
          </div>

          {customisation && !customiseMode && (
            <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-700">
              <Sparkles size={14} /> Design saved - it will go into the cart with this product
            </div>
          )}

          <div className="mt-5 grid gap-3 border-t border-gray-100 pt-5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-brand-500" /> Free shipping on orders over Rs. 999
            </div>
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-brand-800">
              Your artwork now previews on the product surface instead of replacing the whole product image.
            </div>
          </div>
        </div>
      </div>

      {customiseMode && product.isCustomisable && (
        <div className="card p-6 mb-10 border-2 border-brand-100 bg-gradient-to-br from-brand-50/50 to-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center shadow-sm">
              <Paintbrush size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customisation Studio</h2>
              <p className="text-xs text-gray-500">Build your design, save it, then add the final product to cart.</p>
            </div>
          </div>
          <CustomisationStudio product={product} onSave={handleCustomisedSave} />
        </div>
      )}

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
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="input resize-none mb-4"
            />
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
            {product.reviews.map((review) => (
              <div key={review.id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                      {review.user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="font-medium text-sm">{review.user?.name ?? 'Customer'}</span>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={13} className={n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
