import { useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, BadgePercent, CreditCard, MapPin, ShieldCheck, Smartphone, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useCart } from '../contexts/CartContext'

const SHIPPING_THRESHOLD = 999
const SHIPPING_FEE = 99

const initialAddress = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
}

const paymentOptions = [
  { id: 'UPI', label: 'UPI', icon: Smartphone, note: 'Fast online payment' },
  { id: 'CARD', label: 'Card', icon: CreditCard, note: 'Debit or credit card' },
  { id: 'COD', label: 'Cash on Delivery', icon: Truck, note: 'Pay when it arrives' },
]

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function buildMockPaymentId(paymentMethod) {
  return `demo_${paymentMethod.toLowerCase()}_${Date.now()}`
}

export default function Checkout() {
  const { items, total, loading, fetchCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [address, setAddress] = useState(initialAddress)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [discountCode, setDiscountCode] = useState('')
  const [discountState, setDiscountState] = useState(null)
  const [validatingDiscount, setValidatingDiscount] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  const subtotal = total
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const discountAmount = discountState?.savings || 0
  const grandTotal = Math.max(subtotal + shipping - discountAmount, 0)

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const updateAddress = (field, value) => {
    setAddress((current) => ({ ...current, [field]: value }))
  }

  const applyDiscount = async () => {
    const code = discountCode.trim().toUpperCase()
    if (!code) {
      setDiscountState(null)
      toast.error('Enter a discount code first.')
      return
    }

    setValidatingDiscount(true)
    try {
      const { data } = await api.post('/discounts/validate', { code, cartTotal: subtotal })
      setDiscountCode(code)
      setDiscountState({ ...data, code })
      toast.success(`${code} applied successfully.`)
    } catch (error) {
      setDiscountState(null)
      toast.error(error.response?.data?.error || 'Unable to apply discount code.')
    } finally {
      setValidatingDiscount(false)
    }
  }

  const removeDiscount = () => {
    setDiscountCode('')
    setDiscountState(null)
  }

  const placeOrder = async (event) => {
    event.preventDefault()

    if (!items.length) {
      toast.error('Your cart is empty.')
      navigate('/cart')
      return
    }

    setPlacingOrder(true)
    try {
      const payload = {
        paymentMethod,
        address,
        discountCode: discountState?.code || undefined,
        paymentId: paymentMethod === 'COD' ? undefined : buildMockPaymentId(paymentMethod),
      }

      const { data } = await api.post('/orders', payload)
      await fetchCart()
      toast.success('Order placed successfully.')
      navigate('/orders', {
        state: {
          highlightOrderId: data.order.id,
          fromCheckout: true,
        },
      })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not place your order.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <Truck className="text-brand-700" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nothing to check out yet</h1>
        <p className="text-gray-500 mb-6">Add a product to your cart and come back here to complete the order.</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-brand-700 hover:underline mb-3">
            <ArrowLeft size={15} /> Back to cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Review delivery details, payment option, and your final total.</p>
        </div>
        {location.state?.fromCart && (
          <div className="hidden md:flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-700">
            <ShieldCheck size={16} /> Secure checkout
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        <form onSubmit={placeOrder} className="space-y-6">
          <section className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <MapPin size={18} className="text-brand-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                <p className="text-sm text-gray-500">We will use these details for shipping and contact updates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="input" placeholder="Full name" value={address.fullName} onChange={(e) => updateAddress('fullName', e.target.value)} required />
              <input className="input" placeholder="Phone number" value={address.phone} onChange={(e) => updateAddress('phone', e.target.value)} required />
              <input className="input sm:col-span-2" placeholder="Street address" value={address.street} onChange={(e) => updateAddress('street', e.target.value)} required />
              <input className="input" placeholder="City" value={address.city} onChange={(e) => updateAddress('city', e.target.value)} required />
              <input className="input" placeholder="State" value={address.state} onChange={(e) => updateAddress('state', e.target.value)} required />
              <input className="input" placeholder="Pincode" value={address.pincode} onChange={(e) => updateAddress('pincode', e.target.value)} required />
              <input className="input sm:col-span-2" placeholder="Landmark (optional)" value={address.landmark} onChange={(e) => updateAddress('landmark', e.target.value)} />
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <CreditCard size={18} className="text-brand-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                <p className="text-sm text-gray-500">Choose how you want to complete this order.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paymentOptions.map((option) => {
                const Icon = option.icon
                const active = paymentMethod === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-brand-700 bg-brand-50 shadow-sm'
                        : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon size={18} className={active ? 'text-brand-700' : 'text-gray-500'} />
                      <div className={`w-4 h-4 rounded-full border ${active ? 'border-brand-700 bg-brand-700' : 'border-gray-300'}`} />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{option.note}</p>
                  </button>
                )
              })}
            </div>

            {paymentMethod !== 'COD' && (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Online payments generate a payment reference and are marked paid as part of checkout.
              </div>
            )}
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <BadgePercent size={18} className="text-brand-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Discount Code</h2>
                <p className="text-sm text-gray-500">Have a coupon? Apply it before placing the order.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="input"
                placeholder="Enter promo code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              />
              <button type="button" onClick={applyDiscount} disabled={validatingDiscount} className="btn-primary whitespace-nowrap">
                {validatingDiscount ? 'Checking...' : 'Apply Code'}
              </button>
              {discountState && (
                <button type="button" onClick={removeDiscount} className="btn-outline whitespace-nowrap">
                  Remove
                </button>
              )}
            </div>

            {discountState && (
              <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                {discountState.code} saves you {formatCurrency(discountState.savings)} on this order.
              </div>
            )}
          </section>
        </form>

        <aside className="space-y-4">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-4 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.customisation?.snapshot || item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty {item.quantity}</p>
                    {item.customisation?.layers?.length > 0 && (
                      <p className="text-xs text-brand-700 mt-1">Custom design attached</p>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-gray-900 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                Add {formatCurrency(SHIPPING_THRESHOLD - subtotal)} more to unlock free shipping.
              </p>
            )}

            <button onClick={placeOrder} disabled={placingOrder || loading} className="btn-primary w-full mt-6 py-3">
              {placingOrder ? 'Placing order...' : `Place Order ${paymentMethod === 'COD' ? '(COD)' : ''}`}
            </button>

            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Order confirmation is created immediately after checkout, and email notification is sent when mail credentials are configured.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
