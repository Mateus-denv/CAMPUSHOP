import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { categories, products } from '@/lib/mock-data'
import { ArrowRight, Search, Star, Truck, ShieldCheck } from 'lucide-react'

export function HomePage() {
  return (
    <Layout>
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-700 via-indigo-700 to-orange-500 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 sm:p-10 lg:p-12">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-50">
              Marketplace estudantil
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Compre, venda e converse com estudantes em um só lugar
            </h1>
            <p className="mt-5 max-w-xl text-base text-blue-50/90 sm:text-lg">
              Explore produtos do campus, negocie direto no chat e acompanhe tudo no mesmo fluxo.
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-500">Busque livros, eletrônicos, roupas ou serviços</span>
              </div>
              <Link to="/categorias" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.01]">
                Explorar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Star, title: 'Avaliações reais', text: 'Vendedores com histórico e confiança.' },
                { icon: Truck, title: 'Entrega combinada', text: 'Negocie retirada no campus com facilidade.' },
                { icon: ShieldCheck, title: 'Ambiente seguro', text: 'Converse e negocie com mais tranquilidade.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <item.icon className="h-5 w-5 text-orange-200" />
                  <p className="mt-3 font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-blue-50/80">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between rounded-[1.75rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl lg:min-h-[520px]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-50/80">Destaque do dia</p>
                <div className="mt-4 rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-2xl shadow-black/10">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <span>Produto mais visitado</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Disponível</span>
                  </div>
                  <div className="mt-4 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center text-slate-500">
                    Imagem principal do marketplace
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">Livro de lógica de programação</p>
                      <p className="text-sm text-slate-500">Caio Ramos • UFBA • Camaçari</p>
                    </div>
                    <p className="text-2xl font-black text-blue-700">R$ 150</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">12+</p>
                  <p className="text-blue-50/80">Categorias</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">48h</p>
                  <p className="text-blue-50/80">Resposta média</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">100%</p>
                  <p className="text-blue-50/80">Campus local</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Explore por categoria</h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">Encontre exatamente o que você precisa</p>
          </div>
          <Link to="/categorias" className="hidden text-sm font-semibold text-blue-700 hover:text-blue-800 sm:inline-flex">
            Ver todas
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.id} to="/categorias" className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${category.color}`}>
                {category.icon}
              </div>
              <p className="mt-4 font-bold text-slate-900">{category.nome}</p>
              <p className="mt-1 text-xs text-slate-500">{category.quantidade} produtos</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Produtos em destaque</h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">Os melhores produtos selecionados para você</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} to={`/produto/${product.id}`} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400">
                Imagem do produto
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em]">
                  <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700">{product.categoria}</span>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{product.condicao}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">{product.nome}</h3>
                <p className="mt-2 text-sm text-slate-500">{product.vendedor} • {product.local}</p>
                <p className="mt-3 text-2xl font-black text-blue-700">R$ {product.preco.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  )
}