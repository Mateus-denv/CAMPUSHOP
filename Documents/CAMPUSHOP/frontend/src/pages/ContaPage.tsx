import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { useAuthStore } from '@/store'
import { getOrders, getFavorites, removeFromFavorites, addToCart, populateSampleFavorites } from '@/lib/shop-storage'
import { products } from '@/lib/mock-data'
import { Heart, ShoppingCart, MessageCircle, MapPin } from 'lucide-react'

const tabs = ['Visão Geral', 'Compras', 'Favoritos', 'Configurações']

export function ContaPage() {
  const [aba, setAba] = useState('Visão Geral')
  const { usuario } = useAuthStore()
  const pedidos = getOrders()
  const favoritos = getFavorites()

  const nome = usuario?.nomeCompleto || usuario?.nome || 'Minha conta'
  const email = usuario?.email || 'Email não informado'
  const ra = usuario?.ra ? `R.A ${usuario.ra}` : 'R.A não informado'
  const compras = pedidos.length

  const produtosFavoritos = products.filter((produto) => favoritos.includes(produto.id))

  useEffect(() => {
    // Popular favoritos de exemplo se não houver nenhum (apenas para desenvolvimento)
    if (favoritos.length === 0) {
      populateSampleFavorites()
      // Forçar re-render após popular
      setAba(aba)
    }

    // Debug: mostrar no console
    console.log('ContaPage - Aba atual:', aba)
    console.log('ContaPage - Pedidos:', pedidos.length)
    console.log('ContaPage - Favoritos:', favoritos.length)
  }, [favoritos.length, aba, pedidos.length])

  const removerFavorito = (productId: number) => {
    removeFromFavorites(productId)
    // Forçar re-render
    setAba(aba)
  }

  const adicionarAoCarrinho = (productId: number) => {
    addToCart(productId, 1)
    // Forçar re-render ou mostrar feedback
    setAba(aba)
  }

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
            {/* Debug info - remover depois */}
            <div className="mb-2 text-xs text-slate-400">
              Aba atual: "{aba}" | Pedidos: {pedidos.length} | Favoritos: {favoritos.length}
            </div>

            {/* Conteúdo das abas */}
            {aba === 'Visão Geral' && (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Visão Geral</h3>
                <p className="text-slate-600">Esta é a aba de visão geral</p>
              </div>
            )}

            {aba === 'Compras' && (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Minhas Compras</h3>
                <p className="text-slate-600">Esta é a aba de compras</p>
                <p>Pedidos encontrados: {pedidos.length}</p>
              </div>
            )}

            {aba === 'Favoritos' && (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Favoritos</h3>
                <p className="text-slate-600">Esta é a aba de favoritos</p>
                <p>Favoritos encontrados: {favoritos.length}</p>
              </div>
            )}

            {aba === 'Configurações' && (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Configurações</h3>
                <p className="text-slate-600">Esta é a aba de configurações</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </Layout>
  )
}
