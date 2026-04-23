import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Boxes, ClipboardList, PackageCheck, Pencil, Plus, Save, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const ORDER_STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const initialProductForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  categoryId: '',
  stock: '',
  isCustomisable: true,
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function ProductForm({ categories, form, onChange, onSubmit, saving, editingId, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="card p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            {editingId ? 'Edit Product' : 'Add Product'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage the catalogue from here without touching the seed file.
          </p>
        </div>
        {editingId && (
          <button type="button" onClick={onCancel} className="btn-ghost text-sm">
            Cancel Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          className="input"
          placeholder="Product name"
          value={form.name}
          onChange={(event) => onChange('name', event.target.value)}
          required
        />
        <select
          className="input"
          value={form.categoryId}
          onChange={(event) => onChange('categoryId', event.target.value)}
          required
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <input
          className="input md:col-span-2"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(event) => onChange('imageUrl', event.target.value)}
          required
        />

        <textarea
          className="input md:col-span-2 min-h-[120px] resize-none"
          placeholder="Description"
          value={form.description}
          onChange={(event) => onChange('description', event.target.value)}
          required
        />

        <input
          className="input"
          placeholder="Price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(event) => onChange('price', event.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={(event) => onChange('stock', event.target.value)}
          required
        />
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.isCustomisable}
          onChange={(event) => onChange('isCustomisable', event.target.checked)}
        />
        This product supports the customization studio
      </label>

      <button type="submit" disabled={saving} className="btn-primary mt-5 inline-flex items-center gap-2">
        {editingId ? <Save size={16} /> : <Plus size={16} />}
        {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingProduct, setSavingProduct] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [deletingProductId, setDeletingProductId] = useState(null)
  const [form, setForm] = useState(initialProductForm)

  const statCards = useMemo(
    () => [
      { key: 'orders', label: 'Successful Orders', value: stats?.totalOrders ?? 0, icon: ClipboardList, tone: 'from-orange-100 to-amber-50 text-orange-700' },
      { key: 'revenue', label: 'Revenue', value: formatCurrency(stats?.totalRevenue ?? 0), icon: BarChart3, tone: 'from-emerald-100 to-green-50 text-emerald-700' },
      { key: 'users', label: 'Customers', value: stats?.totalUsers ?? 0, icon: Users, tone: 'from-sky-100 to-cyan-50 text-sky-700' },
      { key: 'products', label: 'Products', value: stats?.totalProducts ?? 0, icon: Boxes, tone: 'from-fuchsia-100 to-rose-50 text-fuchsia-700' },
    ],
    [stats]
  )

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [dashboardRes, productsRes, categoriesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/products?limit=100'),
        api.get('/products/categories'),
      ])

      setStats(dashboardRes.data.stats)
      setRecentOrders(dashboardRes.data.recentOrders)
      setProducts(productsRes.data.products)
      setCategories(categoriesRes.data.categories)
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoriesRes.data.categories[0]?.id || '',
      }))
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not load admin dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({
      ...initialProductForm,
      categoryId: categories[0]?.id || '',
    })
  }

  const handleEditProduct = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      stock: String(product.stock),
      isCustomisable: product.isCustomisable,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveProduct = async (event) => {
    event.preventDefault()
    setSavingProduct(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      categoryId: form.categoryId,
      stock: Number(form.stock),
      isCustomisable: Boolean(form.isCustomisable),
    }

    try {
      if (editingId) {
        await api.patch(`/admin/products/${editingId}`, payload)
        toast.success('Product updated.')
      } else {
        await api.post('/admin/products', payload)
        toast.success('Product created.')
      }

      await loadAdminData()
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not save product.')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId)
    try {
      await api.delete(`/admin/products/${productId}`)
      toast.success('Product deleted.')
      await loadAdminData()
      if (editingId === productId) resetForm()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not delete product.')
    } finally {
      setDeletingProductId(null)
    }
  }

  const handleOrderStatusChange = async (orderId, status) => {
    setUpdatingOrderId(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      setRecentOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)))
      toast.success('Order status updated.')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-5 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-[1.75rem] bg-slate-200 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[2rem] bg-[linear-gradient(135deg,#1f4e79_0%,#0f172a_48%,#ec4899_100%)] px-8 py-9 text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Admin Dashboard</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Control the storefront from one place</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
          Track orders, adjust fulfillment status, and manage products without leaving the app.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {statCards.map(({ key, label, value, icon: Icon, tone }) => (
          <div key={key} className="card p-5">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone}`}>
              <Icon size={22} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                <PackageCheck size={20} className="text-brand-700" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Recent Orders</h2>
                <p className="mt-1 text-sm text-slate-500">Update the last few orders without opening another screen.</p>
              </div>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="mt-1 text-sm text-slate-500">{order.user?.name} • {order.user?.email}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <p className="text-lg font-black text-brand-700">{formatCurrency(order.totalAmount)}</p>
                      <select
                        className="input min-w-[180px]"
                        value={order.status}
                        onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
                        disabled={updatingOrderId === order.id}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ProductForm
            categories={categories}
            form={form}
            onChange={updateForm}
            onSubmit={handleSaveProduct}
            saving={savingProduct}
            editingId={editingId}
            onCancel={resetForm}
          />
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Inventory</h2>
              <p className="mt-1 text-sm text-slate-500">Edit or remove products already visible in the storefront.</p>
            </div>
            <span className="badge bg-brand-50 text-brand-700">{products.length} items</span>
          </div>

          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex gap-4">
                  <img src={product.imageUrl} alt={product.name} className="h-20 w-20 rounded-2xl object-cover bg-slate-100" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-slate-900">{product.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{product.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-brand-700">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-slate-500">{product.stock} in stock</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`badge ${product.isCustomisable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {product.isCustomisable ? 'Customisable' : 'Standard'}
                      </span>
                      <button onClick={() => handleEditProduct(product)} className="btn-ghost inline-flex items-center gap-2 text-sm">
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                        {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
