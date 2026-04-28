import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { pedidoAPI } from '@/lib/api-service'
import { getOrders } from '@/lib/shop-storage'

// Tipo que espelha o PedidoResponse do backend
type ApiPedido = {
  id: number
  status: string
  total: number
  criadoEm: string
  itens: {
    idProduto: number
    nomeProduto: string
    quantidade: number
    precoUnitario: number
  }[]
}

// Tipo legado do localStorage
type LocalPedido = ReturnType<typeof getOrders>[number]

export function PedidosPage() {
  const [pedidos, setPedidos] = useState<ApiPedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pedidoAPI
      .listar()
      .then((res) => {
        setPedidos(res.data ?? [])
      })
      .catch(() => {
        // Fallback: exibe pedidos do localStorage quando API estiver indisponível
        const locais = getOrders()
        const convertidos: ApiPedido[] = locais.map((p: LocalPedido) => ({
          id: Number(p.id.replace('PED-', '')) || 0,
          status: p.status,
          total: p.total,
          criadoEm: p.criadoEm,
          itens: p.itens.map((item) => ({
            idProduto: item.productId,
            nomeProduto: `Produto #${item.productId}`,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
          })),
        }))
        setPedidos(convertidos)
      })
      .finally(() => setLoading(false))
  }, [])

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

        {loading && (
          <div className="py-12 text-center text-slate-500">Carregando pedidos...</div>
        )}

        {!loading && !pedidos.length && (
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
                  <h2 className="text-xl font-black text-slate-900">#{pedido.id}</h2>
                  <p className="text-sm text-slate-500">{new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
                  {pedido.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {pedido.itens.map((item) => (
                  <div key={`${pedido.id}-${item.idProduto}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-700">{item.nomeProduto}</span>
                    <span className="text-slate-600">
                      {item.quantidade}x • R$ {item.precoUnitario.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

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
