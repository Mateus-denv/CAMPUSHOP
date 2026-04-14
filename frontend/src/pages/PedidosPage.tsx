import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { getOrders } from '@/lib/shop-storage'
import { products } from '@/lib/mock-data'

export function PedidosPage() {
  const pedidos = getOrders()

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
                <span className="inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
                  {pedido.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {pedido.itens.map((item) => {
                  const product = products.find((p) => p.id === item.productId)
                  return (
                    <div key={`${pedido.id}-${item.productId}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-medium text-slate-700">{product?.nome ?? 'Produto'}</span>
                      <span className="text-slate-600">
                        {item.quantidade}x • R$ {item.precoUnitario.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
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
