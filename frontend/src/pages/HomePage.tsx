import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { categories } from '@/lib/mock-data'
import { produtoAPI } from '@/lib/api-service'
import { addToCartWithSnapshot } from '@/lib/shop-storage'
import { ShoppingCart, Tag, MapPin } from 'lucide-react'

type ApiProduct = {
  idProduto: number
  nomeProduto: string
  descricao: string
  preco: number
  estoque: number
  nomeVendedor?: string
}

export function HomePage() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<ApiProduct[]>([])
  const [adicionado, setAdicionado] = useState<number | null>(null)

  useEffect(() => {
    produtoAPI.listarTodos().then((res) => {
      setProdutos((res.data ?? []).slice(0, 12))
    }).catch(() => setProdutos([]))
  }, [])

  const handleAddCarrinho = (produto: ApiProduct) => {
    addToCartWithSnapshot({
      id: produto.idProduto,
      nome: produto.nomeProduto,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      vendedor: produto.nomeVendedor,
    })
    setAdicionado(produto.idProduto)
    setTimeout(() => setAdicionado(null), 1500)
  }

  return (
    <Layout>
      {/* Banner principal */}
      <section className="overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="max-w-lg">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
              Marketplace Estudantil
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              Compre e venda dentro do seu campus
            </h1>
            <p className="mt-3 text-blue-100">
              Livros, eletrônicos, roupas e serviços entre estudantes da sua instituição.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/produtos"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Ver produtos
              </Link>
              <Link
                to="/categorias"
                className="rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Explorar categorias
              </Link>
            </div>
          </div>
          <div className="hidden shrink-0 gap-3 md:flex md:flex-col">
            {[
              { valor: '2.400+', label: 'Produtos anunciados' },
              { valor: '18', label: 'Categorias' },
              { valor: '14', label: 'Instituições' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-center">
                <p className="text-2xl font-bold">{stat.valor}</p>
                <p className="text-sm text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Categorias</h2>
          <Link to="/categorias" className="text-sm font-medium text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/produtos?categoria=${cat.nome}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-300 hover:shadow-md"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-semibold text-slate-700">{cat.nome}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Produtos em destaque</h2>
          <Link to="/produtos" className="text-sm font-medium text-blue-600 hover:underline">
            Ver todos
          </Link>
        </div>

        {produtos.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
                <div className="h-40 rounded-lg bg-gray-200" />
                <div className="mt-3 h-4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {produtos.map((produto) => (
              <div
                key={produto.idProduto}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-blue-300 hover:shadow-md"
              >
                <Link to={`/produto/${produto.idProduto}`} className="block">
                  <div className="flex h-40 items-center justify-center bg-gray-100 text-gray-400 text-sm font-medium transition group-hover:bg-gray-50">
                    <Tag className="mr-1 h-4 w-4" />
                    Produto
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-800">{produto.nomeProduto}</p>
                    <p className="mt-1 text-lg font-bold text-blue-700">
                      R$ {produto.preco.toFixed(2).replace('.', ',')}
                    </p>
                    {produto.nomeVendedor && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {produto.nomeVendedor}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="border-t border-gray-100 px-3 pb-3">
                  <button
                    onClick={() => handleAddCarrinho(produto)}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {adicionado === produto.idProduto ? 'Adicionado!' : 'Adicionar ao carrinho'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA vendedor */}
      <section className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-orange-900">Tem algo para vender?</h3>
            <p className="mt-1 text-sm text-orange-700">
              Ative o modo vendedor no seu perfil e anuncie gratuitamente para estudantes do seu campus.
            </p>
          </div>
          <Link
            to="/conta"
            className="shrink-0 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Começar a vender
          </Link>
        </div>
      </section>
    </Layout>
  )
}


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