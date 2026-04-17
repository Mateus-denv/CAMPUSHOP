import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { categories, products } from '@/lib/mock-data'
import { ArrowRight, ChevronLeft, ChevronRight, Search, ShieldCheck, Star, Truck } from 'lucide-react'

type DestaqueItem = {
  id: string
  tipo: 'Produto' | 'Servico'
  titulo: string
  descricao: string
  categoria: string
  precoLabel: string
  vendedor: string
  local: string
  link: string
}

export function HomePage() {
  const destaques: DestaqueItem[] = [
    ...products.slice(0, 4).map((product) => ({
      id: `produto-${product.id}`,
      tipo: 'Produto' as const,
      titulo: product.nome,
      descricao: product.descricao,
      categoria: product.categoria,
      precoLabel: `R$ ${product.preco.toFixed(2).replace('.', ',')}`,
      vendedor: product.vendedor,
      local: product.local,
      link: '/produtos',
    })),
    {
      id: 'servico-aulas',
      tipo: 'Servico',
      titulo: 'Aulas particulares de Calculo I',
      descricao: 'Suporte para listas, provas e revisao semanal com estudantes monitores.',
      categoria: 'Servicos',
      precoLabel: 'A partir de R$ 60,00',
      vendedor: 'Equipe CampusShop',
      local: 'Online e presencial',
      link: '/chat',
    },
    {
      id: 'servico-fretes',
      tipo: 'Servico',
      titulo: 'Frete entre campi',
      descricao: 'Entrega e retirada combinada para produtos negociados na plataforma.',
      categoria: 'Servicos',
      precoLabel: 'A partir de R$ 12,00',
      vendedor: 'Rede de parceiros',
      local: 'Campi da regiao',
      link: '/chat',
    },
    {
      id: 'servico-design',
      tipo: 'Servico',
      titulo: 'Design para apresentacoes',
      descricao: 'Criacao de slides academicos e materiais para TCC com entrega rapida.',
      categoria: 'Servicos',
      precoLabel: 'Pacotes a partir de R$ 35,00',
      vendedor: 'Criadores CampusShop',
      local: 'Remoto',
      link: '/chat',
    },
  ]

  const [indiceDestaque, setIndiceDestaque] = useState(0)

  useEffect(() => {
    if (!destaques.length) return

    const timer = setInterval(() => {
      setIndiceDestaque((atual) => (atual + 1) % destaques.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [destaques.length])

  const destaqueAtual = destaques[indiceDestaque]
  const irParaAnterior = () => setIndiceDestaque((atual) => (atual - 1 + destaques.length) % destaques.length)
  const irParaProximo = () => setIndiceDestaque((atual) => (atual + 1) % destaques.length)

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
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Destaques do CampusShop</h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">Carrossel com produtos e servicos em alta na plataforma</p>
          </div>
        </div>

        {destaqueAtual && (
          <div className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">{destaqueAtual.tipo}</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">{destaqueAtual.categoria}</span>
                </div>

                <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {destaqueAtual.titulo}
                </h3>

                <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                  {destaqueAtual.descricao}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span>{destaqueAtual.vendedor}</span>
                  <span>•</span>
                  <span>{destaqueAtual.local}</span>
                </div>

                <p className="mt-5 text-3xl font-black text-blue-700">{destaqueAtual.precoLabel}</p>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    to={destaqueAtual.link}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Ver destaque <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Em destaque agora</p>
                <div className="mt-4 flex h-44 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400">
                  Preview do destaque
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">Atualizado automaticamente a cada 4,5 segundos</p>
              </div>
            </div>

            <button
              type="button"
              onClick={irParaAnterior}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Destaque anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={irParaProximo}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Proximo destaque"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-6 flex justify-center gap-2">
              {destaques.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndiceDestaque(index)}
                  className={`h-2.5 rounded-full transition-all ${index === indiceDestaque ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  aria-label={`Ir para destaque ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}