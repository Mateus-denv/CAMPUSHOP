import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { useAuthStore } from '@/store'
import { getOrders } from '@/lib/shop-storage'

const tabs = ['Visão Geral', 'Compras', 'Favoritos', 'Configurações']

export function ContaPage() {
  const [aba, setAba] = useState('Visão Geral')
  const { usuario } = useAuthStore()
  const pedidos = getOrders()

  const nome = usuario?.nomeCompleto || usuario?.nome || 'Minha conta'
  const email = usuario?.email || 'Email não informado'
  const ra = usuario?.ra ? `R.A ${usuario.ra}` : 'R.A não informado'
  const compras = pedidos.length

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <aside className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-100" />
            <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">{nome}</h2>
            <p className="mt-2 text-center text-sm text-slate-500">{email}</p>
            <p className="text-center text-sm text-slate-500">{ra}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-3xl font-black text-blue-700">8</p><p className="text-sm text-slate-500">Vendas</p></div>
              <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-3xl font-black text-orange-500">{compras}</p><p className="text-sm text-slate-500">Compras</p></div>
            </div>
            <a href="/cadastrar-produto" className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-center font-semibold text-white shadow-lg shadow-blue-600/20">+ Anunciar produto</a>
            <button className="mt-3 w-full rounded-2xl border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Editar perfil</button>
            <button onClick={() => setAba('Configurações')} className="mt-3 w-full rounded-2xl border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Configurações da conta</button>
          </aside>

          <main className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 text-sm font-semibold">
              {tabs.map((item) => (
                <button key={item} onClick={() => setAba(item)} className={`rounded-2xl px-4 py-2.5 transition ${aba === item ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>
                  {item}
                </button>
              ))}
            </div>

            {aba === 'Visão Geral' ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Produtos ativos</p><p className="mt-1 text-3xl font-black text-blue-700">1</p></div>
                  <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Produtos vendidos</p><p className="mt-1 text-3xl font-black text-orange-500">8</p></div>
                  <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Pedidos</p><p className="mt-1 text-3xl font-black text-emerald-600">{compras}</p></div>
                </div>
                <div className="mt-4 min-h-[260px] rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Atividade recente</h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-700 sm:text-base">
                    <p>🟢 Seus produtos mais vistos aparecem aqui</p>
                    <p>🟠 Você possui {compras} pedidos registrados</p>
                    <p>🔵 Vendas recentes são atualizadas automaticamente</p>
                    <div className="pt-2">
                      <Link to="/pedidos" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                        Ver meus pedidos
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Configurações da conta</h3>
                <p className="mt-1 text-slate-500">Atualize seu código de entrega para confirmar pedidos com segurança.</p>
                <div className="mt-4 rounded-2xl bg-blue-50 p-6 text-center">
                  <p className="text-sm text-slate-600">Seu código atual</p>
                  <p className="mt-2 text-4xl font-black tracking-[0.3em] text-blue-700">_ _ _ _</p>
                </div>
                <input className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Novo código de entrega" />
                <button className="mt-3 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white">Atualizar código</button>
                <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
                  <p className="mb-2 font-semibold text-slate-900">Importante:</p>
                  <ul className="list-inside list-disc text-slate-600">
                    <li>Pode ser solicitado por quem vai fazer a entrega</li>
                    <li>Não deve ser compartilhado no chat</li>
                    <li>Não pode ser igual aos 4 últimos dígitos do telefone</li>
                  </ul>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </Layout>
  )
}
