import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { categories, products } from '@/lib/mock-data'

export function CategoriasPage() {
  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Todas as categorias</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Explore todos os produtos disponíveis</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((category) => (
            <div key={category.id} className="rounded-[1.5rem] border border-slate-200 px-4 py-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${category.color}`}>
                {category.icon}
              </div>
              <p className="mt-4 font-bold text-slate-900">{category.nome}</p>
              <p className="mt-1 text-xs text-slate-500">{category.quantidade} produtos</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm md:flex-row md:items-center">
          <span className="font-semibold text-slate-700">Filtros</span>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none">
            <option>Todos os tipos</option>
          </select>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none">
            <option>Todas as condições</option>
          </select>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none md:ml-auto">
            <option>Mais recente</option>
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400">Imagem</div>
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em]">
                  <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700">{product.categoria}</span>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{product.condicao}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">{product.nome}</h3>
                <p className="mt-2 text-2xl font-black text-blue-700">R$ {product.preco.toFixed(2)}</p>
                <p className="mt-1 text-xs text-slate-500">{product.vendedor} • {product.local}</p>
                <Link to={`/produto/${product.id}`} className="mt-4 block w-full rounded-2xl bg-slate-900 py-3 text-center font-semibold text-white transition-transform hover:scale-[1.01]">Ver produto</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}
