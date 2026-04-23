import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Sparkles, Tag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import ProductPreview from '../components/ProductPreview'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, total, updateItem, removeItem, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleQty = async (item, delta) => {
    const next = item.quantity + delta
    if (next < 1) {
      await removeItem(item.id)
      toast('Item removed')
    } else {
      await updateItem(item.id, next)
    }
  }

  const handleRemove = async (item) => {
    await removeItem(item.id)
    toast('Item removed from cart')
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <ShoppingBag size={36} className="text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you have not added anything yet. Let us fix that.</p>
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
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-8">
        Your Cart <span className="text-slate-400 font-normal text-lg">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <ProductPreview product={item.product} customisation={item.customisation} className="h-full w-full" />
                {item.customisation && (
                  <div className="absolute top-1 left-1">
                    <span className="bg-brand-700 rounded-full p-0.5 flex items-center justify-center" title="Customised">
                      <Sparkles size={8} className="text-white" />
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/product/${item.product.id}`} className="font-semibold text-gray-800 text-sm hover:text-brand-700 transition-colors line-clamp-2">
                      {item.product.name}
                    </Link>
                    {item.customisation && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                        <Sparkles size={9} /> Customised on product
                      </span>
                    )}
                    {item.customisation?.layers?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.customisation.layers.filter((layer) => layer.type === 'text').map((layer) => `"${layer.text}"`).join(', ')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleRemove(item)} className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                    <button onClick={() => handleQty(item, -1)} className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors">
                      <Minus size={13} />
                    </button>
                    <span className="min-w-[32px] px-3 py-1.5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQty(item, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-40"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="font-bold text-brand-700">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card sticky top-20 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Order Summary</h3>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Add Rs. {(999 - total).toFixed(0)} more for free shipping</p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <Tag size={14} className="shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">Discount codes and scheduled gift delivery are both available at checkout.</p>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { fromCart: true } })}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <Link to="/shop" className="mt-4 block text-center text-sm text-brand-700 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
