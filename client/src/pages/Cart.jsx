import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Sparkles, Tag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, total, updateItem, removeItem, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleQty = async (item, delta) => {
    const next = item.quantity + delta
    if (next < 1) {
      await removeItem(item.id)
      toast('Item removed', { icon: '🗑️' })
    } else {
      await updateItem(item.id, next)
    }
  }

  const handleRemove = async (item) => {
    await removeItem(item.id)
    toast('Item removed from cart', { icon: '🗑️' })
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={36} className="text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Let's fix that!</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Browse Products <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  const shipping = total >= 999 ? 0 : 99
  const grandTotal = total + shipping

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Your Cart <span className="text-gray-400 font-normal text-lg">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                <img
                  src={item.customisation?.snapshot || item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
                {item.customisation && (
                  <div className="absolute top-1 left-1">
                    <span className="bg-brand-700 rounded-full p-0.5 flex items-center justify-center" title="Customised">
                      <Sparkles size={8} className="text-white" />
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/product/${item.product.id}`} className="font-semibold text-gray-800 text-sm hover:text-brand-700 transition-colors line-clamp-2">
                      {item.product.name}
                    </Link>
                    {item.customisation && (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full mt-1">
                        <Sparkles size={9} /> Customised
                      </span>
                    )}
                    {item.customisation?.layers?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.customisation.layers.filter(l => l.type === 'text').map(l => `"${l.text}"`).join(', ')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleRemove(item)} className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Qty controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => handleQty(item, -1)} className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors">
                      <Minus size={13} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold min-w-[32px] text-center">{item.quantity}</span>
                    <button onClick={() => handleQty(item, +1)} disabled={item.quantity >= item.product.stock}
                      className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-40">
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="font-bold text-brand-700">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-5">Order Summary</h3>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Add ₹{(999 - total).toFixed(0)} more for free shipping</p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Discount code teaser */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <Tag size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">Have a discount code? Apply it at checkout.</p>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { fromCart: true } })}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <Link to="/shop" className="block text-center text-sm text-brand-700 hover:underline mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
