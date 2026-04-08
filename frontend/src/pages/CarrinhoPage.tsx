import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { products } from '@/lib/mock-data'

export function CarrinhoPage() {
  const navigate = useNavigate()
  const [quantidade1, setQuantidade1] = useState(1)
  const [quantidade2, setQuantidade2] = useState(1)
  const [modalChat, setModalChat] = useState(false)

  const produto1 = products[2]
  const produto2 = products[0]
  const total = produto1.preco * quantidade1 + produto2.preco * quantidade2

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6">
          <Link to="/categorias" className="text-sm font-semibold text-slate-600 transition hover:text-blue-700">← Continuar comprando</Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Meu carrinho</h1>
          <p className="mt-2 text-sm text-slate-500">2 produtos no seu carrinho</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[{ p: produto1, q: quantidade1, set: setQuantidade1 }, { p: produto2, q: quantidade2, set: setQuantidade2 }].map(({ p, q, set }) => (
              <div key={p.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 p-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-2xl sm:w-24">📦</div>
                <div className="flex-1">
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">{p.condicao}</span>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{p.nome}</h3>
                  <p className="text-sm text-slate-500">Vendido por: {p.vendedor}</p>
                  <p className="mt-2 text-2xl font-black text-blue-700">R$ {p.preco.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button onClick={() => set(Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50">−</button>
                  <span className="w-8 text-center font-semibold text-slate-700">{q}</span>
                  <button onClick={() => set(q + 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50">+</button>
                </div>
              </div>
            ))}

            <h2 className="mt-8 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Você também pode gostar</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex h-36 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 font-semibold text-slate-400">
                  Produto Recomendado
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Resumo do pedido</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>Subtotal (2 itens)</span><strong>R$ {total.toFixed(2)}</strong></div>
                <div className="flex justify-between"><span>Entrega</span><span>A negociar</span></div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <strong className="text-lg text-slate-900">Total</strong>
                <strong className="text-xl text-blue-700">R$ {total.toFixed(2)}</strong>
              </div>
              <button onClick={() => setModalChat(true)} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-[1.01]">Ir para chat</button>
              <button className="mt-3 w-full rounded-2xl border border-slate-200 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50">Salvar para depois</button>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">🛍️</div>
              <p className="mt-2 font-bold text-slate-900">Compra segura</p>
              <p className="mt-1 text-xs text-slate-500">Seus dados e pagamentos estão protegidos por criptografia.</p>
            </div>
          </div>
        </div>
      </section>

      {modalChat && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Escolha com qual vendedor deseja conversar</h3>
                <p className="mt-1 text-sm text-slate-500">Você possui produtos de diferentes vendedores.</p>
              </div>
              <button onClick={() => setModalChat(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-slate-500 transition hover:bg-slate-50">✕</button>
            </div>
            <div className="mt-5 space-y-3">
              <button onClick={() => navigate('/chat')} className="w-full rounded-[1.5rem] border border-slate-200 p-4 text-left transition hover:bg-slate-50">
                <p className="font-bold text-slate-900">João Silva <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">UFBA</span></p>
                <p className="text-sm text-slate-500">Livro de lógica de programação - R$ 150,00</p>
              </button>
              <button onClick={() => navigate('/chat')} className="w-full rounded-[1.5rem] border border-slate-200 p-4 text-left transition hover:bg-slate-50">
                <p className="font-bold text-slate-900">Maria Lima <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">UFBA</span></p>
                <p className="text-sm text-slate-500">Empada Doce - R$ 10,00</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}