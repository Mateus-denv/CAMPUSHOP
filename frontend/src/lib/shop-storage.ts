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

export type CartProductSnapshot = {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  condicao?: string
  vendedor?: string
}

export type FavoriteProductSnapshot = {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  categoria?: string
}

const CART_KEY = 'campushop_cart'
const ORDERS_KEY = 'campushop_orders'
const PRODUCT_CACHE_KEY = 'campushop_product_cache'
const FAVORITES_KEY = 'campushop_favorites'
const FAVORITES_CACHE_KEY = 'campushop_favorites_cache'

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

export function getProductCache(): Record<number, CartProductSnapshot> {
  return loadJson<Record<number, CartProductSnapshot>>(PRODUCT_CACHE_KEY, {})
}

function saveProductCache(cache: Record<number, CartProductSnapshot>) {
  saveJson(PRODUCT_CACHE_KEY, cache)
}

export function cacheProduct(product: CartProductSnapshot) {
  const cache = getProductCache()
  cache[product.id] = product
  saveProductCache(cache)
}

export function getCachedProduct(productId: number): CartProductSnapshot | null {
  const cache = getProductCache()
  return cache[productId] ?? null
}

export function addToCartWithSnapshot(product: CartProductSnapshot, quantidade: number = 1) {
  cacheProduct(product)
  const cart = getCart()
  const existing = cart.find((item) => item.productId === product.id)
  if (existing) {
    existing.quantidade += quantidade
  } else {
    cart.push({ productId: product.id, quantidade })
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
      const cached = getCachedProduct(item.productId)
      const product = cached ?? products.find((p) => p.id === item.productId)
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

function saveFavorites(favorites: number[]) {
  saveJson(FAVORITES_KEY, favorites)
}

function getFavoritesCache(): Record<number, FavoriteProductSnapshot> {
  return loadJson<Record<number, FavoriteProductSnapshot>>(FAVORITES_CACHE_KEY, {})
}

function saveFavoritesCache(cache: Record<number, FavoriteProductSnapshot>) {
  saveJson(FAVORITES_CACHE_KEY, cache)
}

export function cacheFavoriteProduct(product: FavoriteProductSnapshot) {
  const cache = getFavoritesCache()
  cache[product.id] = product
  saveFavoritesCache(cache)
}

export function isFavorite(productId: number): boolean {
  return getFavorites().includes(productId)
}

export function toggleFavorite(product: FavoriteProductSnapshot): boolean {
  const favorites = getFavorites()
  const alreadyFavorite = favorites.includes(product.id)

  if (alreadyFavorite) {
    saveFavorites(favorites.filter((id) => id !== product.id))
    return false
  }

  cacheFavoriteProduct(product)
  saveFavorites([product.id, ...favorites])
  return true
}

export function getFavoriteProducts(): FavoriteProductSnapshot[] {
  const favorites = getFavorites()
  const cache = getFavoritesCache()

  return favorites
    .map((id) => cache[id])
    .filter((item): item is FavoriteProductSnapshot => item !== undefined)
}
