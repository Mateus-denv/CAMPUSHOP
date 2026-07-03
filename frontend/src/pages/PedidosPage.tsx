import { Layout } from '@/components/Layout'
import { PlanBadge } from '@/components/PlanBadge'
import { pedidosAPI, subscriptionAPI, type PedidoAPI, type SubscriptionAPI } from '@/lib/api-service'
import { useAuthStore } from '@/store'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function statusClasses(status: PedidoAPI['status']) {
  if (status === 'em analise') {
    return 'bg-orange-100 text-orange-700'
  }

  if (status === 'aceito') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (status === 'rejeitado' || status === 'invalido') {
    return 'bg-red-100 text-red-700'
  }

  if (status === 'entregue') {
    return 'bg-blue-100 text-blue-700'
  }

  return 'bg-orange-100 text-orange-700'
}

function formatarData(data?: string | null) {
  return data ? new Date(data).toLocaleString('pt-BR') : 'Aguardando confirmação'
}

function montarAvisoPrazo(pedido: PedidoAPI) {
  if (pedido.status !== 'aceito' || !pedido.prazoEntregaLimite) {
    return null
  }

  const prazo = new Date(pedido.prazoEntregaLimite)
  const agora = new Date()
  const diferencaMs = prazo.getTime() - agora.getTime()
  const diasRestantes = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24))

  if (diferencaMs < 0) {
    return `Prazo expirado em ${prazo.toLocaleDateString('pt-BR')}. Pedido será invalidado.`
  }

  if (diasRestantes <= 1) {
    return `Entrega vence hoje (${prazo.toLocaleDateString('pt-BR')}).`;
  }

  if (diasRestantes <= 2) {
    return `Faltam ${diasRestantes} dias para o prazo de entrega (${prazo.toLocaleDateString('pt-BR')}).`;
  }

  return null
}

export function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoAPI[]>([])
  const [carregando, setCarregando] = useState(true)
  const [assinatura, setAssinatura] = useState<SubscriptionAPI | null>(null)
  const { usuario } = useAuthStore()

  useEffect(() => {
    const carregarPlano = async () => {
      try {
        const response = await subscriptionAPI.current()
        setAssinatura(response.data ?? null)
      } catch {
        setAssinatura(null)
      }
    }

    const carregarPedidos = async () => {
      try {
        setCarregando(true)
        // O backend retorna somente os pedidos do comprador autenticado.
        const response = await pedidosAPI.meus()
        setPedidos(response.data ?? [])
      } finally {
        setCarregando(false)
      }
    }

    carregarPlano()
    carregarPedidos()
  }, [usuario])

  if (carregando) {
    return (
      <Layout>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Carregando seus pedidos...</p>
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
          <PlanBadge text={assinatura?.badgeText || assinatura?.planName || 'ESSENCIAL'} color={assinatura?.badgeColor} icon={assinatura?.badgeIcon} />
          <Link to="/produtos" className="inline-flex w-fit rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Fazer nova compra
          </Link>
        </div>

        {!pedidos.length && (
          <div className="rounded-[1.5rem] border border-slate-200 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">Você ainda não tem pedidos.</p>
            <Link to="/produtos" className="mt-4 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Ver produtos
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <article key={pedido.id} className="rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pedido</p>
                  <h2 className="text-xl font-black text-slate-900">{pedido.id}</h2>
                  <p className="text-sm text-slate-500">{new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClasses(pedido.status)}`}>
                  {pedido.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="font-semibold text-slate-900">Código de acesso</p>
                  <p>{pedido.chaveAcesso || 'Aguardando aprovação do vendedor'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Vendedor</p>
                  <p>{pedido.vendedor.nome}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Compra</p>
                  <p>{pedido.itens.length} item(ns)</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 rounded-[1.25rem] border border-slate-200 p-4 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="font-semibold text-slate-900">Aprovado em</p>
                  <p>{formatarData(pedido.aprovadoEm)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Prazo limite</p>
                  <p>{formatarData(pedido.prazoEntregaLimite)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Entregue em</p>
                  <p>{formatarData(pedido.entregueEm)}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {pedido.itens.map((item) => {
                  return (
                    <div key={`${pedido.id}-${item.productId}`} className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-700">{item.productName}</p>
                        <p className="text-slate-500">{item.quantidade}x • R$ {item.precoUnitario.toFixed(2)}</p>
                      </div>
                      {pedido.status === 'entregue' ? (
                        <Link
                          to={`/produto/${item.productId}`}
                          className="inline-flex rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 transition hover:bg-blue-100"
                        >
                          Avaliar produto
                        </Link>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              {pedido.status === 'em analise' ? (
                <p className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
                  Pedido em análise. Aguarde o vendedor aceitar para seguir com a negociação.
                </p>
              ) : pedido.status === 'aceito' ? (
                <>
                  <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    Pedido aceito pelo vendedor. O código de acesso já está disponível para a entrega.
                  </p>
                  {montarAvisoPrazo(pedido) ? (
                    <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                      {montarAvisoPrazo(pedido)}
                    </p>
                  ) : null}
                </>
              ) : pedido.status === 'invalido' ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  Pedido invalidado: {pedido.motivoRejeicao || 'Prazo de entrega expirado'}.
                </p>
              ) : pedido.status === 'entregue' ? (
                <p className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                  Pedido entregue e confirmado. As datas ficaram registradas para consulta futura.
                </p>
              ) : pedido.status === 'rejeitado' && pedido.motivoRejeicao ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  Pedido rejeitado automaticamente: {pedido.motivoRejeicao}.
                </p>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <strong className="text-lg text-blue-700">R$ {pedido.total.toFixed(2)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  )
}
