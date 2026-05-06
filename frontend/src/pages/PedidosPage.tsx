import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { addOrderToCart, cancelOrder, fetchOrders } from '@/lib/shop-storage'

export function PedidosPage() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authAviso, setAuthAviso] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'pendentes' | 'concluidos' | 'cancelados'>('todos')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setPedidos([])
      setAuthAviso('Faça login para ver seus pedidos.')
      setLoading(false)
      return
    }

    try {
      const orders = await fetchOrders()
      setPedidos(orders)
      setAuthAviso(null)
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        setAuthAviso('Sua sessão expirou. Faça login novamente.')
      } else {
        setAuthAviso('Não foi possível carregar seus pedidos.')
      }
      setPedidos([])
    }
    setLoading(false)
  }

  const handleCancel = async (orderId: string) => {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
      const success = await cancelOrder(orderId)
      if (success) {
        loadOrders() // Recarregar pedidos
      } else {
        alert('Erro ao cancelar pedido')
      }
    }
  }

  const handleReorder = (orderId: string) => {
    const success = addOrderToCart(orderId)
    if (success) {
      navigate('/carrinho')
      return
    }
    alert('Não foi possível adicionar os itens novamente')
  }

  const handleChat = () => {
    navigate('/chat')
  }

  const handleToggleDetails = (orderId: string) => {
    setExpandedId((current) => (current === orderId ? null : orderId))
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado'
      case 'entregue':
        return 'Entregue'
      case 'cancelado':
        return 'Cancelado'
      case 'pendente':
      case 'aguardando':
      default:
        return 'Pendente'
    }
  }

  const statusStyle = (status: string) => {
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado', emoji: '🔵', className: 'bg-blue-100 text-blue-700 border-blue-200' }
      case 'entregue':
        return { label: 'Entregue', emoji: '🟢', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
      case 'cancelado':
        return { label: 'Cancelado', emoji: '🔴', className: 'bg-red-100 text-red-700 border-red-200' }
      case 'pendente':
      case 'aguardando':
      default:
        return { label: 'Pendente', emoji: '🟡', className: 'bg-amber-100 text-amber-700 border-amber-200' }
    }
  }

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    return formatter.format(date).replace(',', ' às')
  }

  const formatOrderId = (orderId: string) => `#${orderId.padStart(4, '0')}`

  const groupStatus = (status: string) => {
    if (status === 'cancelado') {
      return 'cancelados'
    }
    if (status === 'entregue') {
      return 'concluidos'
    }
    if (status === 'confirmado') {
      return 'concluidos'
    }
    return 'pendentes'
  }

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'todos') {
      return pedidos
    }
    return pedidos.filter((pedido) => groupStatus(pedido.status) === selectedFilter)
  }, [pedidos, selectedFilter])

  const counts = useMemo(() => {
    const base = { todos: pedidos.length, pendentes: 0, concluidos: 0, cancelados: 0 }
    pedidos.forEach((pedido) => {
      const group = groupStatus(pedido.status)
      base[group] += 1
    })
    return base
  }, [pedidos])

  if (loading) {
    return (
      <Layout>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="text-center">Carregando pedidos...</div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Meus pedidos</h1>
            <p className="mt-2 text-sm text-slate-500">Acompanhe o status das suas compras</p>
          </div>
          <Link to="/produtos" className="inline-flex w-fit rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Fazer nova compra
          </Link>
        </div>

        {authAviso && (
          <div className="mb-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {authAviso}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: 'todos', label: `Todos (${counts.todos})` },
            { id: 'pendentes', label: `Pendentes (${counts.pendentes})` },
            { id: 'concluidos', label: `Concluídos (${counts.concluidos})` },
            { id: 'cancelados', label: `Cancelados (${counts.cancelados})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as typeof selectedFilter)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                selectedFilter === tab.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!filteredOrders.length && !authAviso && (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              📦
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-700">Você ainda não tem pedidos por aqui.</p>
            <p className="mt-2 text-sm text-slate-500">Explore o marketplace e finalize sua primeira compra.</p>
            <Link to="/produtos" className="mt-5 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Explorar produtos
            </Link>
          </div>
        )}

        <div className="space-y-5">
          {filteredOrders.map((pedido) => {
            const statusInfo = statusStyle(pedido.status)
            const itemsCount = pedido.itens.reduce((acc: number, item: any) => acc + item.quantidade, 0)
            const firstItem = pedido.itens[0]
            const rating = firstItem?.avaliacaoVendedor
            const campus = firstItem?.campusVendedor ?? 'Campus não informado'
            const nomeProduto = firstItem?.nomeProduto ?? 'Produto do pedido'
            const nomeVendedor = firstItem?.nomeVendedor ?? 'Vendedor'
            const imagemProduto = firstItem?.imagemProduto
            const initial = nomeProduto.trim().charAt(0).toUpperCase() || 'P'
            const isExpanded = expandedId === pedido.id
            const timelineSteps = ['Pedido realizado', 'Confirmado', 'Em andamento', 'Entregue']
            const activeStep = pedido.status === 'entregue'
              ? 3
              : pedido.status === 'confirmado'
                ? 1
                : pedido.status === 'cancelado'
                  ? 0
                  : 0

            return (
              <article
                key={pedido.id}
                onClick={() => handleToggleDetails(pedido.id)}
                className="cursor-pointer rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pedido</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Pedido {formatOrderId(pedido.id)}</h2>
                    <p className="mt-2 text-sm text-slate-500">Realizado em {formatDate(pedido.criadoEm)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${statusInfo.className}`}>
                      <span className="text-base">{statusInfo.emoji}</span>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-5 rounded-[1.25rem] bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-2xl shadow-sm">
                      {imagemProduto ? (
                        <img src={imagemProduto} alt={nomeProduto} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-slate-600">{initial}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{nomeProduto}</p>
                      <p className="text-xs text-slate-500">
                        Vendido por {nomeVendedor}
                        {typeof rating === 'number' ? ` ⭐ ${rating.toFixed(1)}` : ' • Sem avaliações'}
                      </p>
                      <p className="text-xs text-slate-400">{campus}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-1 text-left lg:items-end">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total do pedido</p>
                    <p className="text-2xl font-black text-blue-700">R$ {pedido.total.toFixed(2)}</p>
                    <p className="text-xs font-semibold text-slate-500">{itemsCount} {itemsCount === 1 ? 'item' : 'itens'}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-700">Progresso do pedido</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {timelineSteps.map((step, index) => (
                          <div key={step} className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${index <= activeStep ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                            <span className={`h-2 w-2 rounded-full ${index <= activeStep ? 'bg-blue-600' : 'bg-slate-300'}`} />
                            {step}
                          </div>
                        ))}
                        {pedido.status === 'cancelado' && (
                          <span className="text-xs font-semibold text-red-600">Pedido cancelado</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {pedido.itens.map((item: any) => (
                        <div key={`${pedido.id}-${item.productId}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm">
                          <span className="font-medium text-slate-700">{item.nomeProduto ?? 'Produto'}</span>
                          <span className="text-slate-600">
                            {item.quantidade}x • R$ {item.precoUnitario.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleToggleDetails(pedido.id)
                    }}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    Ver detalhes
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      setExpandedId(pedido.id)
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Acompanhar
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleChat()
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Conversar com vendedor
                  </button>
                  {statusLabel(pedido.status) === 'Pendente' && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        handleCancel(pedido.id)
                      }}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Cancelar pedido
                    </button>
                  )}
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleReorder(pedido.id)
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Comprar novamente
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </Layout>
  )
}
