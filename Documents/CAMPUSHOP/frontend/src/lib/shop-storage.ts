import { products } from '@/lib/mock-data'

export type CartItem = {
  productId: number
  quantidade: number
}

export type OrderItem = {
  productId: number
  quantidade: number
  precoUnitario: number
}

export type Order = {
  id: string
  criadoEm: string
  status: 'aguardando' | 'confirmado' | 'entregue'
  itens: OrderItem[]
  total: number
}

const CART_KEY = 'campushop_cart'
const ORDERS_KEY = 'campushop_orders'
const FAVORITES_KEY = 'campushop_favorites'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getCart(): CartItem[] {
  return loadJson<CartItem[]>(CART_KEY, [])
}

export function saveCart(cart: CartItem[]) {
  saveJson(CART_KEY, cart)
}

export function addToCart(productId: number, quantidade: number = 1) {
  const cart = getCart()
  const existing = cart.find((item) => item.productId === productId)
  if (existing) {
    existing.quantidade += quantidade
  } else {
    cart.push({ productId, quantidade })
  }
  saveCart(cart)
}

export function updateCartItem(productId: number, quantidade: number) {
  const cart = getCart()
    .map((item) => (item.productId === productId ? { ...item, quantidade } : item))
    .filter((item) => item.quantidade > 0)
  saveCart(cart)
}

export function removeFromCart(productId: number) {
  const cart = getCart().filter((item) => item.productId !== productId)
  saveCart(cart)
}

export function clearCart() {
  saveCart([])
}

export function getOrders(): Order[] {
  return loadJson<Order[]>(ORDERS_KEY, [])
}

export function createOrderFromCart(): Order | null {
  const cart = getCart()
  if (!cart.length) {
    return null
  }

  const itens: OrderItem[] = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return null
      }
      return {
        productId: item.productId,
        quantidade: item.quantidade,
        precoUnitario: product.preco,
      }
    })
    .filter((item): item is OrderItem => item !== null)

  if (!itens.length) {
    return null
  }

  const total = itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0)
  const order: Order = {
    id: `PED-${Date.now().toString().slice(-6)}`,
    criadoEm: new Date().toISOString(),
    status: 'aguardando',
    itens,
    total,
  }

  const orders = getOrders()
  saveJson(ORDERS_KEY, [order, ...orders])
  clearCart()
  return order
}

export function countCartItems() {
  return getCart().reduce((acc, item) => acc + item.quantidade, 0)
}

export function getFavorites(): number[] {
  return loadJson<number[]>(FAVORITES_KEY, [])
}

export function addToFavorites(productId: number) {
  const favorites = getFavorites()
  if (!favorites.includes(productId)) {
    favorites.push(productId)
    saveJson(FAVORITES_KEY, favorites)
  }
}

export function removeFromFavorites(productId: number) {
  const favorites = getFavorites().filter((id) => id !== productId)
  saveJson(FAVORITES_KEY, favorites)
}

export function isFavorite(productId: number): boolean {
  return getFavorites().includes(productId)
}

export function toggleFavorite(productId: number) {
  if (isFavorite(productId)) {
    removeFromFavorites(productId)
  } else {
    addToFavorites(productId)
  }
}

// Função para popular favoritos de exemplo (apenas para desenvolvimento)
export function populateSampleFavorites() {
  const sampleFavorites = [1, 2, 3] // IDs dos primeiros produtos
  const currentFavorites = getFavorites()
  const newFavorites = [...new Set([...currentFavorites, ...sampleFavorites])]
  saveJson(FAVORITES_KEY, newFavorites)
}
