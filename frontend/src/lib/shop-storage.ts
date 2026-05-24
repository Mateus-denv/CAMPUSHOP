import { products } from '@/lib/mock-data'

export type CartItem = {
  productId: number
  quantidade: number
}

export type OrderItem = {
  productId: number
  productName: string
  quantidade: number
  precoUnitario: number
  vendedorId?: number
  vendedorNome: string
}

export type OrderParty = {
  id?: number
  nome: string
  email?: string
  perfil?: string
}

export type OrderStatus = 'aguardando' | 'aceito' | 'rejeitado' | 'entregue'

export type Order = {
  id: string
  chaveAcesso: string
  criadoEm: string
  status: OrderStatus
  rejectionReason?: string
  comprador: OrderParty
  vendedor: OrderParty
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
  vendedorId?: number
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

type UserReference = {
  id?: number | null
  email?: string | null
}

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

function notifyOrdersChanged() {
  if (typeof window === 'undefined') {
    return
  }

  // Disparamos um evento local para atualizar telas abertas no mesmo navegador.
  window.dispatchEvent(new Event('campushop-orders-changed'))
}

function normalizeText(value?: string | null) {
  return value?.trim() ?? ''
}

function normalizeStatus(status?: string | null): OrderStatus {
  const valorNormalizado = normalizeText(status).toLowerCase()

  if (valorNormalizado === 'aceito' || valorNormalizado === 'rejeitado' || valorNormalizado === 'entregue') {
    return valorNormalizado
  }

  return 'aguardando'
}

function normalizeParty(party: Partial<OrderParty> | null | undefined, fallbackNome: string): OrderParty {
  return {
    id: typeof party?.id === 'number' ? party.id : undefined,
    nome: normalizeText(party?.nome) || fallbackNome,
    email: normalizeText(party?.email),
    perfil: normalizeText(party?.perfil),
  }
}

function getStoredUserParty(): OrderParty | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) {
      return null
    }

    const usuario = JSON.parse(raw) as Partial<OrderParty> & { nomeCompleto?: string; role?: string; perfil?: string }
    const nome = usuario.nomeCompleto ?? usuario.nome ?? 'Cliente'

    return {
      id: typeof usuario.id === 'number' ? usuario.id : undefined,
      nome,
      email: normalizeText(usuario.email),
      perfil: normalizeText(usuario.perfil ?? usuario.role),
    }
  } catch {
    return null
  }
}

function buildAccessKey(existingOrders: Order[]) {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digito = () => Math.floor(Math.random() * 10).toString()

  let tentativa = ''

  do {
    // Mantemos o formato curto exigido pelo banco para a chave de entrega.
    tentativa = [
      letras[Math.floor(Math.random() * letras.length)],
      digito(),
      letras[Math.floor(Math.random() * letras.length)],
      digito(),
      letras[Math.floor(Math.random() * letras.length)],
      digito(),
      digito(),
      digito(),
    ].join('')
  } while (existingOrders.some((order) => order.chaveAcesso === tentativa))

  return tentativa
}

function normalizeOrder(order: any, index: number): Order {
  const comprador = normalizeParty(
    order?.comprador ?? { id: order?.compradorId, nome: order?.compradorNome, email: order?.compradorEmail, perfil: order?.compradorPerfil },
    'Cliente'
  )
  const vendedor = normalizeParty(
    order?.vendedor ?? { id: order?.vendedorId, nome: order?.vendedorNome, email: order?.vendedorEmail, perfil: order?.vendedorPerfil },
    'Vendedor'
  )

  return {
    id: normalizeText(order?.id) || `PED-LEGACY-${index + 1}`,
    chaveAcesso: normalizeText(order?.chaveAcesso) || normalizeText(order?.chaveEntrega) || `LEG-${index + 1}`,
    criadoEm: normalizeText(order?.criadoEm) || normalizeText(order?.dataPedido) || new Date().toISOString(),
    status: normalizeStatus(order?.status ?? order?.statusPedido),
    rejectionReason: normalizeText(order?.rejectionReason ?? order?.motivoRejeicao) || undefined,
    comprador,
    vendedor,
    itens: Array.isArray(order?.itens)
      ? order.itens.map((item: any) => ({
          productId: Number(item?.productId ?? item?.produtoId ?? 0),
          productName: normalizeText(item?.productName ?? item?.nomeProduto ?? item?.produtoNome) || 'Produto',
          quantidade: Number(item?.quantidade ?? 0),
          precoUnitario: Number(item?.precoUnitario ?? item?.preco ?? 0),
          vendedorId: typeof item?.vendedorId === 'number' ? item.vendedorId : undefined,
          vendedorNome: normalizeText(item?.vendedorNome ?? item?.nomeVendedor) || 'Vendedor',
        }))
      : [],
    total: Number(order?.total ?? order?.valorPedido ?? 0),
  }
}

function saveOrders(orders: Order[]) {
  saveJson(ORDERS_KEY, orders)
  notifyOrdersChanged()
}

function matchesUser(party: OrderParty | undefined, user?: UserReference | null) {
  if (!party || !user) {
    return false
  }

  if (typeof party.id === 'number' && typeof user.id === 'number' && party.id === user.id) {
    return true
  }

  return normalizeText(party.email).toLowerCase() === normalizeText(user.email).toLowerCase()
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
  return loadJson<any[]>(ORDERS_KEY, []).map((order, index) => normalizeOrder(order, index))
}

export function createOrdersFromCart(buyer?: OrderParty | null): Order[] | null {
  const cart = getCart()
  if (!cart.length) {
    return null
  }

  const comprador = normalizeParty(buyer ?? getStoredUserParty(), 'Cliente')
  const pedidosAgrupados = new Map<
    string,
    {
      vendedor: OrderParty
      itens: OrderItem[]
    }
  >()

  cart.forEach((item) => {
    const cached = getCachedProduct(item.productId)
    const product = cached ?? products.find((p) => p.id === item.productId)

    if (!product) {
      return
    }

    const produtoNome = (product as CartProductSnapshot & { nomeProduto?: string }).nome ?? (product as any).nomeProduto ?? 'Produto'
    const vendedorId = typeof cached?.vendedorId === 'number' ? cached.vendedorId : undefined
    const vendedorNome = normalizeText(cached?.vendedor ?? (product as any).vendedor) || 'Vendedor não informado'
    const chaveAgrupamento = vendedorId !== undefined ? `id:${vendedorId}` : `nome:${vendedorNome.toLowerCase()}`

    if (!pedidosAgrupados.has(chaveAgrupamento)) {
      pedidosAgrupados.set(chaveAgrupamento, {
        vendedor: {
          id: vendedorId,
          nome: vendedorNome,
        },
        itens: [],
      })
    }

    pedidosAgrupados.get(chaveAgrupamento)?.itens.push({
      productId: item.productId,
      productName: produtoNome,
      quantidade: item.quantidade,
      precoUnitario: product.preco,
      vendedorId,
      vendedorNome,
    })
  })

  if (!pedidosAgrupados.size) {
    return null
  }

  const orders = getOrders()
  const novosPedidos: Order[] = []

  Array.from(pedidosAgrupados.values()).forEach((grupo) => {
    const pedido: Order = {
      id: `PED-${Date.now().toString().slice(-6)}-${novosPedidos.length + 1}`,
      // A chave é gerada por pedido para manter o acesso individual em cada venda.
      chaveAcesso: buildAccessKey([...orders, ...novosPedidos]),
      criadoEm: new Date().toISOString(),
      status: 'aguardando',
      comprador,
      vendedor: grupo.vendedor,
      itens: grupo.itens,
      total: grupo.itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0),
    }

    novosPedidos.push(pedido)
  })

  saveOrders([...novosPedidos, ...orders])
  clearCart()
  return novosPedidos
}

export function createOrderFromCart(buyer?: OrderParty | null): Order | null {
  const pedidosCriados = createOrdersFromCart(buyer)
  return pedidosCriados?.[0] ?? null
}

export function getBuyerOrders(user?: UserReference | null): Order[] {
  return getOrders().filter((order) => matchesUser(order.comprador, user))
}

export function getSellerOrders(user?: UserReference | null): Order[] {
  return getOrders().filter((order) => matchesUser(order.vendedor, user))
}

export function getPendingSellerOrdersCount(user?: UserReference | null) {
  return getSellerOrders(user).filter((order) => order.status === 'aguardando').length
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getOrders()
  const targetOrder = orders.find((order) => order.id === orderId)

  if (!targetOrder) {
    return null
  }

  const acceptanceRejectionReason = 'Fora de estoque'
  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      return {
        ...order,
        status,
        rejectionReason: undefined,
      }
    }

    if (status === 'aceito' && targetOrder.itens.length === 1 && order.status === 'aguardando') {
      const [targetItem] = targetOrder.itens
      const [candidateItem] = order.itens
      const mesmaMercadoria = order.itens.length === 1 && candidateItem.productId === targetItem.productId

      if (mesmaMercadoria) {
        // Quando um comprador leva a única unidade, as demais solicitações ficam indisponíveis.
        return {
          ...order,
          status: 'rejeitado' as OrderStatus,
          rejectionReason: acceptanceRejectionReason,
        }
      }
    }

    return order
  })

  saveOrders(updatedOrders)
  return updatedOrders.find((order) => order.id === orderId) ?? null
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
