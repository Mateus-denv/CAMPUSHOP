import { Link, useParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { products } from '@/lib/mock-data'

export function ProdutoDetalhePage() {
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id)) ?? products[0]

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-slate-500">Categorias / {product.categoria} / {product.nome}</p>
        <Link to="/categorias" className="mt-2 inline-block font-semibold text-slate-700 transition hover:text-blue-700">← Voltar aos produtos</Link>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="flex h-80 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400">
              Imagem principal
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
              <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
              <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
            </div>
          </div>

          <div>
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">{product.categoria.toLowerCase()}</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{product.nome}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{product.condicao}</span>
              <span className="text-xs text-slate-500">Publicado em 05/10/2025</span>
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <p className="text-3xl font-black text-blue-700 sm:text-4xl">R$ {product.preco.toFixed(2)}</p>
              {product.precoOriginal && <p className="pb-1 text-sm font-semibold text-slate-400 line-through">R$ {product.precoOriginal.toFixed(2)}</p>}
            </div>
            <p className="mt-1 text-sm text-slate-500">{product.local}, BA</p>

            <div className="mt-6 space-y-3">
              <button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-[1.01]">Adicionar ao carrinho</button>
              <Link to="/chat" className="block w-full rounded-2xl bg-orange-500 py-3.5 text-center font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]">Conversar com vendedor</Link>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Entrega a negociar preferencialmente na região da UFBA ou locais próximos.
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-900">Vendedor</h3>
              <p className="mt-1 font-semibold text-slate-800">{product.vendedor}</p>
              <p className="text-xs text-slate-500">Universidade Federal da Bahia (UFBA)</p>
              <div className="mt-3 flex justify-between text-xs text-slate-600">
                <span>Membro desde: Junho/2024</span>
                <span>Vendas realizadas: 12</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 p-5 sm:p-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Descrição do produto</h2>
          <p className="mt-3 text-slate-700">{product.descricao}</p>
          <ul className="mt-4 list-inside list-disc text-sm text-slate-700">
            <li>Sabores disponíveis e envio na região do campus</li>
            <li>Produto em ótimo estado e pronto para uso</li>
            <li>Aceita PIX ou dinheiro</li>
          </ul>
        </div>
      </section>
    </Layout>
  )
}
