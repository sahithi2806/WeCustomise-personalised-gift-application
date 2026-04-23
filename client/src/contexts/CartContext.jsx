import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems]   = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); setTotal(0); return }
    setLoading(true)
    try {
      const { data } = await api.get('/cart')
      setItems(data.items)
      setTotal(data.total)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId, quantity = 1, customisation = null) => {
    const { data } = await api.post('/cart', { productId, quantity, customisation })
    await fetchCart()
    return data
  }

  const updateItem = async (itemId, quantity) => {
    await api.patch(`/cart/${itemId}`, { quantity })
    await fetchCart()
  }

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    await fetchCart()
  }

  const clearCart = async () => {
    await api.delete('/cart')
    setItems([]); setTotal(0)
  }

  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, count, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
