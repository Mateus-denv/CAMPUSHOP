import { products } from '@/lib/mock-data'
import api from '@/lib/api'

export type CartItem = {
  productId: number
  quantidade: number
}

export type OrderItem = {
  productId: number
  quantidade: number
  precoUnitario: number
  nomeProduto?: string
  nomeVendedor?: string
  campusVendedor?: string
  avaliacaoVendedor?: number | null
  imagemProduto?: string
  categoria?: string
}

export type Order = {
  id: string
  criadoEm: string
  status: 'aguardando' | 'pendente' | 'confirmado' | 'entregue' | 'cancelado'
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

function getProductStock(productId: number): number | null {
  const cached = getCachedProduct(productId)
  if (cached && typeof cached.estoque === 'number') {
    return cached.estoque
  }
  const product = products.find((item) => item.id === productId)
  if (!product) {
    return null
  }
  const maybeProduct = product as { estoque?: number }
  if (typeof maybeProduct.estoque !== 'number') {
    return null
  }
  return maybeProduct.estoque
}

function clampQuantity(productId: number, quantidade: number): number {
  const estoque = getProductStock(productId)
  if (estoque === null) {
    return quantidade
  }
  return Math.min(quantidade, estoque)
}

export function addToCart(productId: number, quantidade: number = 1) {
  const cart = getCart()
  const existing = cart.find((item) => item.productId === productId)
  if (existing) {
    const novaQuantidade = clampQuantity(productId, existing.quantidade + quantidade)
    if (novaQuantidade <= 0) {
      return
    }
    existing.quantidade = novaQuantidade
  } else {
    const novaQuantidade = clampQuantity(productId, quantidade)
    if (novaQuantidade <= 0) {
      return
    }
    cart.push({ productId, quantidade: novaQuantidade })
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
    const novaQuantidade = clampQuantity(product.id, existing.quantidade + quantidade)
    if (novaQuantidade <= 0) {
      return
    }
    existing.quantidade = novaQuantidade
  } else {
    const novaQuantidade = clampQuantity(product.id, quantidade)
    if (novaQuantidade <= 0) {
      return
    }
    cart.push({ productId: product.id, quantidade: novaQuantidade })
  }
  saveCart(cart)
}

export function updateCartItem(productId: number, quantidade: number) {
  const quantidadeAjustada = clampQuantity(productId, quantidade)
  const cart = getCart()
    .map((item) => (item.productId === productId ? { ...item, quantidade: quantidadeAjustada } : item))
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
  // TODO: Replace with API call
  return loadJson<Order[]>(ORDERS_KEY, [])
}

export function cancelLocalOrder(orderId: string): boolean {
  const orders = getOrders()
  const order = orders.find((item) => item.id === orderId)
  if (!order || (order.status !== 'aguardando' && order.status !== 'pendente')) {
    return false
  }
  const updated = orders.map((item) =>
    item.id === orderId ? { ...item, status: 'cancelado' } : item
  )
  saveJson(ORDERS_KEY, updated)
  return true
}

export function moveOrderToCartForEdit(orderId: string): boolean {
  const orders = getOrders()
  const orderIndex = orders.findIndex((item) => item.id === orderId)
  if (orderIndex === -1) {
    return false
  }
  const order = orders[orderIndex]
  if (order.status !== 'aguardando' && order.status !== 'pendente') {
    return false
  }

  const cart = getCart()
  const merged = [...cart]

  order.itens.forEach((item) => {
    const existing = merged.find((cartItem) => cartItem.productId === item.productId)
    if (existing) {
      existing.quantidade += item.quantidade
    } else {
      merged.push({ productId: item.productId, quantidade: item.quantidade })
    }
  })

  saveCart(merged)
  const updatedOrders = orders.filter((item) => item.id !== orderId)
  saveJson(ORDERS_KEY, updatedOrders)
  return true
}

export function addOrderToCart(orderId: string): boolean {
  const orders = getOrders()
  const order = orders.find((item) => item.id === orderId)
  if (!order) {
    return false
  }

  const cart = getCart()
  const merged = [...cart]

  order.itens.forEach((item) => {
    const existing = merged.find((cartItem) => cartItem.productId === item.productId)
    const quantidade = clampQuantity(item.productId, item.quantidade)
    if (quantidade <= 0) {
      return
    }
    if (existing) {
      existing.quantidade = clampQuantity(item.productId, existing.quantidade + quantidade)
    } else {
      merged.push({ productId: item.productId, quantidade })
    }
  })

  saveCart(merged)
  return true
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await api.get('/api/pedidos')
    const data = response.data ?? []
    const orders = data.map((pedido: any) => ({
      id: pedido.idPedido.toString(),
      criadoEm: pedido.dataPedido,
      status: pedido.statusPedido.toLowerCase(),
      itens: (pedido.itens ?? []).map((item: any) => {
        const produto = item.produto ?? {}
        return {
          productId: produto.idProduto ?? item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          nomeProduto: produto.nomeProduto,
          nomeVendedor: produto.nomeVendedor,
          campusVendedor: produto.campusVendedor,
          avaliacaoVendedor: produto.avaliacaoVendedor,
          imagemProduto: produto.imagemProduto,
          categoria: produto.categoria?.nomeCategoria,
        }
      }),
      total: pedido.valorTotal,
    }))
    saveJson(ORDERS_KEY, orders)
    return orders
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return []
  }
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  try {
    const response = await api.put(`/api/pedidos/${orderId}/cancelar`)
    return response.status >= 200 && response.status < 300
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error)
    return false
  }
}

export async function checkoutCart(paymentTypeId: number): Promise<{ order: Order | null; error?: string }> {
  try {
    const cart = getCart()
    const itens = cart.map((item) => ({
      produtoId: item.productId,
      quantidade: item.quantidade,
    }))
    const response = await api.post('/api/pedidos/checkout', {
      idTipoPagamento: paymentTypeId,
      itens,
    })
    const data = response.data
    if (!data) {
      return { order: null, error: 'Resposta inválida do servidor.' }
    }
    return {
      order: {
        id: data.idPedido.toString(),
        criadoEm: data.dataPedido,
        status: data.statusPedido.toLowerCase(),
        itens: (data.itens ?? []).map((item: any) => {
          const produto = item.produto ?? {}
          return {
            productId: produto.idProduto ?? item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            nomeProduto: produto.nomeProduto,
            nomeVendedor: produto.nomeVendedor,
            campusVendedor: produto.campusVendedor,
            avaliacaoVendedor: produto.avaliacaoVendedor,
            imagemProduto: produto.imagemProduto,
            categoria: produto.categoria?.nomeCategoria,
          }
        }),
        total: data.valorTotal,
      },
    }
  } catch (error) {
    const message = error?.response?.data?.message ?? 'Erro ao finalizar pedido.'
    console.error('Erro ao finalizar pedido:', message)
    return { order: null, error: message }
  }
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
      const estoque = getProductStock(item.productId)
      if (estoque !== null && item.quantidade > estoque) {
        return null
      }
      return {
        productId: item.productId,
        quantidade: item.quantidade,
        precoUnitario: product.preco,
        nomeProduto: product.nome,
        nomeVendedor: product.vendedor,
        campusVendedor: product.local,
        avaliacaoVendedor: null,
        categoria: product.categoria,
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
