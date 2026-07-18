import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'

export type CartItem = {
  cartKey: string // productId + variantLabel — unique per distinct size/variant
  productId: string
  productName: string
  variantLabel?: string
  stripePrice: string
  quantity: number
  price: number
  image?: string
}

export const makeCartKey = (productId: string, variantLabel?: string) =>
  variantLabel ? `${productId}-${variantLabel}` : productId

type CartContextType = {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity' | 'cartKey'>) => void
  removeItem: (cartKey: string) => void
  updateQty: (cartKey: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: number
  count: number
}

const CartCtx = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'pvr-cart'

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity' | 'cartKey'>) => {
    const key = makeCartKey(item.productId, item.variantLabel)
    setItems(prev => {
      const existing = prev.find(i => i.cartKey === key)
      if (existing) {
        return prev.map(i =>
          i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, cartKey: key, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((cartKey: string) => {
    setItems(prev => prev.filter(i => i.cartKey !== cartKey))
  }, [])

  const updateQty = useCallback((cartKey: string, qty: number) => {
    if (qty < 1) {
      setItems(prev => prev.filter(i => i.cartKey !== cartKey))
    } else {
      setItems(prev =>
        prev.map(i => i.cartKey === cartKey ? { ...i, quantity: qty } : i)
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartCtx.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        total,
        count,
      }}
    >
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
