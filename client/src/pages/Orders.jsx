import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Clock3, Gift, MapPin, Package, ShoppingBag, Truck, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import ProductPreview from '../components/ProductPreview'

const statusConfig = {
  PLACED: { label: 'Placed', icon: Clock3, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  PROCESSING: { label: 'Processing', icon: Package, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
  SHIPPED: { label: 'Shipped', icon: Truck, tone: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, tone: 'bg-green-50 text-green-700 border-green-100' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, tone: 'bg-rose-50 text-rose-700 border-rose-100' },
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function getTimeline(order) {
  const steps = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

  if (order.status === 'CANCELLED') {
    return steps.map((step) => ({
      key: step,
      label: statusConfig[step].label,
      complete: step === 'PLACED',
      active: step === 'PLACED',
      cancelled: true,
    }))
  }

  const activeIndex = Math.max(steps.indexOf(order.status), 0)

  return steps.map((step, index) => ({
    key: step,
    label: statusConfig[step].label,
    complete: index <= activeIndex,
    active: index === activeIndex,
    cancelled: false,
  }))
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const { state } = useLocation()

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/orders')
        setOrders(data.orders)
      } catch (error) {
        toast.error(error.response?.data?.error || 'Could not load your orders.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const cancelOrder = async (orderId) => {
    setCancellingId(orderId)
    try {
      await api.post(`/orders/${orderId}/cancel`)
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: 'CANCELLED' } : order)))
      toast.success('Order cancelled successfully.')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not cancel this order.')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((item) => <div key={item} className="h-64 bg-gray-200 rounded-3xl" />)}
        </div>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <ShoppingBag className="text-brand-700" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h1>
        <p className="text-gray-500 mb-6">Once you place an order, it will show up here with payment and delivery details.</p>
        <Link to="/shop" className="btn-primary">
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track progress, review delivery details, and manage your orders after purchase.</p>
        </div>
        <Link to="/shop" className="hidden sm:inline-flex btn-outline text-sm">
          Continue Shopping
        </Link>
      </div>

      {state?.highlightOrderId && (
        <div className="mb-6 rounded-3xl border border-green-100 bg-green-50 px-5 py-4 text-green-700">
          Your order was placed successfully. Order reference: #{state.highlightOrderId.slice(0, 8).toUpperCase()}
        </div>
      )}

      <div className="space-y-5">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.PLACED
          const StatusIcon = status.icon
          const canCancel = ['PLACED', 'PROCESSING'].includes(order.status)
          const timeline = getTimeline(order)
          const address = order.address || {}

          return (
            <article key={order.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {order.isGift && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                        <Gift size={13} />
                        Scheduled gift
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                    <p className="text-sm text-gray-500 mt-1">Payment: {order.paymentMethod} | {order.paymentStatus}</p>
                    {order.discount && (
                      <p className="text-sm text-green-700 mt-1">Discount used: {order.discount.code}</p>
                    )}
                    {order.isGift && order.scheduledDeliveryAt && (
                      <p className="text-sm text-fuchsia-700 mt-1">
                        Scheduled for {new Date(order.scheduledDeliveryAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-gray-500 mb-1">Subtotal</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(order.summary?.subtotal)}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-gray-500 mb-1">Shipping</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(order.summary?.shipping)}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-gray-500 mb-1">Total</p>
                      <p className="font-semibold text-brand-700">{formatCurrency(order.summary?.totalAmount || order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-gray-50/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
                      <Truck size={16} className="text-brand-700" />
                      Delivery Progress
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {timeline.map((step) => (
                        <div key={step.key} className="rounded-2xl bg-white border border-gray-100 px-4 py-3">
                          <div className={`mb-3 h-3 w-3 rounded-full ${step.cancelled ? 'bg-rose-300' : step.complete ? 'bg-brand-700' : 'bg-gray-200'}`} />
                          <p className={`text-sm font-medium ${step.active ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {step.cancelled ? 'Order stopped' : step.complete ? 'Complete' : 'Pending'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  {canCancel && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                      className="rounded-xl border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  <div className="text-sm text-gray-500">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                  </div>
                  <Link to="/gifts" className="inline-flex items-center gap-2 text-sm text-brand-700 hover:underline">
                    <Gift size={14} /> Schedule a future gift
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5">
                <div className="rounded-2xl bg-gray-50 px-4 py-4">
                  <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400">
                    <MapPin size={13} /> Delivery Address
                  </p>
                  <p className="text-sm font-medium text-gray-900">{address.fullName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {[address.street, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                  {order.isGift && (
                    <div className="mt-3 rounded-2xl border border-fuchsia-100 bg-white px-4 py-3 text-sm text-fuchsia-800">
                      <p className="font-semibold">Gift for {order.recipientName}</p>
                      {order.giftMessage && <p className="mt-1 text-fuchsia-700">{order.giftMessage}</p>}
                    </div>
                  )}
                </div>

                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <ProductPreview product={item.product} customisation={item.customisation} className="h-16 w-16 rounded-2xl bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500 mt-1">Qty {item.quantity} | {formatCurrency(item.price)} each</p>
                      {item.customisation && (
                        <p className="text-xs text-brand-700 mt-1">Custom design saved with this item</p>
                      )}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
