import { Layout } from '@/components/Layout'
import { MediaImage } from '@/components/MediaImage'
import { categoriaAPI, produtoAPI } from '@/lib/api-service'
import { buildProductImageUrl } from '@/lib/image-utils'
import { categories, products } from '@/lib/mock-data'
import { ArrowRight, ChevronLeft, ChevronRight, Search, ShieldCheck, Star, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type ProdutoHome = {
  idProduto: number
  nomeProduto: string
  descricao: string
  preco: number
  vendedorNome: string
  local: string
  categoriaId?: number
  categoria: string
  distanciaKm?: number
  cidade?: string
  estado?: string
}

type CategoriaHome = {
  id: number
  nome: string
  quantidade: number
}

function formatarPreco(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function normalizarProduto(produto: any): ProdutoHome {
  const categoriaObjeto = typeof produto.categoria === 'object' && produto.categoria ? produto.categoria : null
  const categoriaNome =
    produto.nomeCategoria ?? categoriaObjeto?.nome_categoria ?? categoriaObjeto?.nome ?? (typeof produto.categoria === 'string' ? produto.categoria : '')

  const categoriaIdBruto = produto.categoriaId ?? categoriaObjeto?.idCategoria ?? categoriaObjeto?.id
  const categoriaId = Number(categoriaIdBruto)

  return {
    idProduto: Number(produto.idProduto ?? produto.id ?? 0),
    nomeProduto: produto.nomeProduto ?? produto.nome ?? produto.titulo ?? 'Produto sem nome',
    descricao: produto.descricao ?? produto.descricaoCurta ?? produto.descricaoLonga ?? '',
    preco: Number(produto.preco ?? produto.precoOriginal ?? 0),
    vendedorNome:
      produto.nomeVendedor ?? produto.vendedorNome ?? produto.usuario?.nomeCompleto ?? produto.usuario?.nomeCliente ?? produto.vendedor ?? 'Vendedor do campus',
    local: displayLocalComDistancia(produto),
    categoriaId: Number.isFinite(categoriaId) && categoriaId > 0 ? categoriaId : undefined,
    categoria: categoriaNome || 'Sem categoria',
    distanciaKm: produto.distanciaKm ?? produto.distancia ?? null,
    cidade: produto.cidadeVendedor ?? produto.cidade ?? produto.usuario?.cidade ?? undefined,
    estado: produto.estadoVendedor ?? produto.estado ?? undefined,
  }
}

  // Modifica local para incluir a distância quando disponível
  function formatDistanceLabel(distance?: number | null) {
    if (distance == null) {
      return ''
    }
    if (distance < 1) {
      return 'Perto de você'
    }
    return `${distance} km`
  }

  function displayLocalComDistancia(produto: any) {
    const base = produto.local ?? produto.cidade ?? produto.instituicao ?? ''
    if (produto.distanciaKm != null) {
      const distanceLabel = formatDistanceLabel(produto.distanciaKm)
      return base ? `${base} • ${distanceLabel}` : distanceLabel
    }
    return base
  }

  const buildGoogleMapsUrl = (cidade?: string, estado?: string) => {
    if (!cidade) return undefined
    const query = encodeURIComponent([cidade, estado].filter(Boolean).join(', '))
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

function agruparCategorias(produtos: ProdutoHome[]) {
  const mapa = new Map<string, CategoriaHome>()

  produtos.forEach((produto) => {
    const chave = produto.categoriaId ? `id:${produto.categoriaId}` : `nome:${produto.categoria.toLowerCase()}`
    const existente = mapa.get(chave)

    if (existente) {
      existente.quantidade += 1
      return
    }

    mapa.set(chave, {
      id: produto.categoriaId ?? mapa.size + 1,
      nome: produto.categoria,
      quantidade: 1,
    })
  })

  return Array.from(mapa.values())
}

function normalizarCategorias(categoriasApi: any[], produtos: ProdutoHome[]) {
  if (!categoriasApi || !categoriasApi.length) {
    return agruparCategorias(produtos)
  }

  const contagemPorId = new Map<number, number>()
  const contagemPorNome = new Map<string, number>()

  produtos.forEach((produto) => {
    if (produto.categoriaId) {
      contagemPorId.set(produto.categoriaId, (contagemPorId.get(produto.categoriaId) ?? 0) + 1)
    }

    if (produto.categoria) {
      const chave = produto.categoria.trim().toLowerCase()
      contagemPorNome.set(chave, (contagemPorNome.get(chave) ?? 0) + 1)
    }
  })

  return categoriasApi.map((categoria) => {
    const id = Number(categoria.idCategoria ?? categoria.id)
    const nome = categoria.nome_categoria ?? categoria.nome ?? 'Categoria'
    const quantidadeApi = Number(categoria.quantidade ?? categoria.total ?? categoria.produtosCount ?? 0)
    const quantidadeProdutos = contagemPorId.get(id) ?? contagemPorNome.get(nome.trim().toLowerCase()) ?? 0

    return {
      id: Number.isFinite(id) && id > 0 ? id : quantidadeProdutos,
      nome,
      quantidade: quantidadeApi > 0 ? quantidadeApi : quantidadeProdutos,
    }
  })
}

export function HomePage() {
  const [busca, setBusca] = useState('')
  const [indiceDestaque, setIndiceDestaque] = useState(0)
  const [produtos, setProdutos] = useState<ProdutoHome[]>([])
  const [categorias, setCategorias] = useState<CategoriaHome[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [proximosAtivo, setProximosAtivo] = useState(false)
  const [raioFiltro, setRaioFiltro] = useState<number>(20)

  // termo de busca usado para filtrar destaques
  const termoBusca = busca.trim().toLowerCase()

  async function carregarProdutosProximos(lat: number, lon: number, raio: number) {
    try {
      setCarregando(true)
      const resp = await produtoAPI.proximos(lat, lon, raio)
      const produtosNormalizados = (resp.data ?? []).map((p: any) => normalizarProduto(p))
      setProdutos(produtosNormalizados)
    } catch (e) {
      console.debug('Erro ao carregar produtos próximos', e)
    } finally {
      setCarregando(false)
    }
  }

  // Carrega dados do backend, mas usa fallback para mocks locais quando necessário.
  useEffect(() => {
    let ativo = true

    const carregarDados = async () => {
      try {
        setCarregando(true)
        setErro('')

        const [categoriasResponse, produtosResponse] = await Promise.allSettled([
          categoriaAPI.listar(),
          produtoAPI.listarTodos(),
        ])

        const produtosNormalizados =
          produtosResponse.status === 'fulfilled'
            ? (produtosResponse.value.data ?? []).map(normalizarProduto).filter((p: ProdutoHome) => Boolean(p.idProduto))
            : (products ?? []).map((p: any) => normalizarProduto(p))

        const categoriasNormalizadas =
          categoriasResponse.status === 'fulfilled'
            ? normalizarCategorias(categoriasResponse.value.data ?? [], produtosNormalizados)
            : normalizarCategorias(categories ?? [], produtosNormalizados)

        if (!ativo) return

        if (produtosResponse.status !== 'fulfilled' && categoriasResponse.status !== 'fulfilled') {
          setErro('Não foi possível carregar os dados reais da home.')
        }

        setProdutos(produtosNormalizados)
        setCategorias(categoriasNormalizadas)
      } catch (error) {
        console.error('Erro ao carregar a home:', error)
        if (ativo) setErro('Não foi possível carregar os dados reais da home.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarDados()

    return () => {
      ativo = false
    }
  }, [])

  const destaquesFiltrados = useMemo(() => {
    const base = produtos.slice(0, 8)

    if (!termoBusca) return base

    return base.filter((produto) => {
      return [produto.nomeProduto, produto.descricao, produto.categoria, produto.vendedorNome, produto.local]
        .join(' ')
        .toLowerCase()
        .includes(termoBusca)
    })
  }, [produtos, termoBusca])

  useEffect(() => {
    if (!destaquesFiltrados.length) {
      setIndiceDestaque(0)
      return
    }

    const timer = window.setInterval(() => {
      setIndiceDestaque((atual) => (atual + 1) % destaquesFiltrados.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [destaquesFiltrados.length])

  useEffect(() => {
    setIndiceDestaque(0)
  }, [termoBusca])

  const destaqueAtual = destaquesFiltrados[indiceDestaque]
  const categoriasVisiveis = categorias.slice(0, 5)

  const outrosDestaques = useMemo(() => {
    const len = destaquesFiltrados.length
    if (len <= 1) return []
    const next1 = destaquesFiltrados[(indiceDestaque + 1) % len]
    const next2 = destaquesFiltrados[(indiceDestaque + 2) % len]
    const arr: ProdutoHome[] = []
    if (next1 && next1.idProduto !== destaqueAtual?.idProduto) arr.push(next1)
    if (next2 && next2.idProduto !== destaqueAtual?.idProduto && next2.idProduto !== next1.idProduto) arr.push(next2)
    return arr
  }, [destaquesFiltrados, indiceDestaque, destaqueAtual])

  const irParaAnterior = () => {
    if (!destaquesFiltrados.length) return
    setIndiceDestaque((atual) => (atual - 1 + destaquesFiltrados.length) % destaquesFiltrados.length)
  }

  const irParaProximo = () => {
    if (!destaquesFiltrados.length) return
    setIndiceDestaque((atual) => (atual + 1) % destaquesFiltrados.length)
  }

  if (carregando) {
    return (
      <Layout>
        <div className="py-12 text-center text-slate-500">Carregando dados reais da home...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      {erro ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {erro}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#1F4DD7] via-indigo-800 to-orange-500 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 sm:p-10 lg:p-12">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-50">
              Marketplace estudantil
            </span>
            <h1 className="hero-title mt-6 max-w-2xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-[64px]">
              Compre, venda e converse com estudantes em um só lugar
            </h1>
            <p className="mt-5 max-w-xl text-base text-blue-50/90 sm:text-lg">
              Explore produtos reais do campus, negocie direto no chat e acompanhe tudo no mesmo fluxo.
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Busque livros, eletrônicos, roupas ou serviços"
                  aria-label="Buscar destaques na home"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={proximosAtivo} onChange={(e) => {
                    const ativo = e.target.checked
                    setProximosAtivo(ativo)
                    if (ativo && navigator && navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        carregarProdutosProximos(pos.coords.latitude, pos.coords.longitude, raioFiltro)
                      }, (err) => console.debug('Geo denied', err))
                    }
                    if (!ativo) {
                      // Recarrega a home com dados padrão
                      window.location.reload()
                    }
                  }} /> Produtos próximos
                </label>

                <select value={raioFiltro} onChange={(e) => setRaioFiltro(Number(e.target.value))} className="rounded-lg border p-2 text-sm">
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>

                <Link
                  to={busca.trim() ? { pathname: '/produtos', search: `?busca=${encodeURIComponent(busca.trim())}` } : '/produtos'}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.01]"
                >
                  Explorar agora <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <p className="mt-3 text-sm text-blue-50/80">
              {termoBusca
                ? `${destaquesFiltrados.length} resultado${destaquesFiltrados.length === 1 ? ' encontrado' : 's'} para "${busca.trim()}"`
                : 'Os destaques abaixo vêm dos produtos cadastrados no backend.'}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex flex-col items-start gap-2 text-left">
                  <Star className="h-6 w-6 text-[#D4A017]" />
                  <p className="text-sm font-semibold text-white">Avaliações reais</p>
                  <p className="mt-1 text-sm text-blue-50/80">Vendedores com histórico e confiança.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex flex-col items-start gap-2 text-left">
                  <Truck className="h-6 w-6 text-[#D4A017]" />
                  <p className="text-sm font-semibold text-white">Entrega combinada</p>
                  <p className="mt-1 text-sm text-blue-50/80">Negocie retirada no campus com facilidade.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex flex-col items-start gap-2 text-left">
                  <ShieldCheck className="h-6 w-6 text-[#D4A017]" />
                  <p className="text-sm font-semibold text-white">Ambiente seguro</p>
                  <p className="mt-1 text-sm text-blue-50/80">Converse e negocie com mais tranquilidade.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />

            {destaqueAtual ? (
              <div className="relative flex h-full flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/20 p-6 backdrop-blur-xl lg:min-h-[520px]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-50/80">Destaque do dia</p>
                    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-4 text-slate-900 shadow-lg">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <span>Produto em destaque agora</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Disponível</span>
                    </div>

                    <Link to={`/produto/${destaqueAtual.idProduto}`} className="mt-4 block">
                      <MediaImage
                        src={buildProductImageUrl(destaqueAtual.idProduto)}
                        alt={destaqueAtual.nomeProduto}
                        fallbackLabel="Sem foto"
                        className="h-56 w-full rounded-[1.25rem]"
                        imageClassName="h-56 w-full rounded-[1.25rem]"
                      />
                    </Link>

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{destaqueAtual.nomeProduto}</p>
                        <p className="text-sm text-slate-500">
                          {destaqueAtual.vendedorNome}
                        </p>
                        {destaqueAtual.local ? (
                    buildGoogleMapsUrl(destaqueAtual.cidade, destaqueAtual.estado) ? (
                      <a
                        href={buildGoogleMapsUrl(destaqueAtual.cidade, destaqueAtual.estado)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <span>📍</span>
                        <span>{destaqueAtual.local}</span>
                      </a>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        <span>📍</span>
                        <span>{destaqueAtual.local}</span>
                      </div>
                    )
                  ) : null}
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900">{formatarPreco(destaqueAtual.preco)}</p>
                    </div>
                    
                    {/* Outros produtos em destaque: mostrar os próximos dois itens do carrossel */}
                    {outrosDestaques.length ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-400">Outros produtos em destaque</p>
                        <div className="mt-2 space-y-2">
                          {outrosDestaques.map((op) => (
                            <Link
                              key={op.idProduto}
                              to={`/produto/${op.idProduto}`}
                              className="block rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{op.nomeProduto}</p>
                                  <p className="text-xs text-slate-500">{op.vendedorNome}</p>
                                </div>
                                <div className="text-sm font-bold text-slate-900">{formatarPreco(op.preco)}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                  </div>
                </div>

                {/* Métricas posicionadas dentro do painel de destaque, alinhadas inferiormente */}
                <div className="mt-4 flex justify-center gap-3">
                  <div className="w-24 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center shadow-sm backdrop-blur-md">
                    <p className="text-xl font-extrabold text-white">{categorias.length}</p>
                    <p className="mt-1 text-xs text-blue-50/80">Categorias</p>
                  </div>

                  <div className="w-24 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center shadow-sm backdrop-blur-md">
                    <p className="text-xl font-extrabold text-white">48h</p>
                    <p className="mt-1 text-xs text-blue-50/80">Resposta média</p>
                  </div>

                  <div className="w-24 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center shadow-sm backdrop-blur-md">
                    <p className="text-xl font-extrabold text-white">100%</p>
                    <p className="mt-1 text-xs text-blue-50/80">Campus local</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex h-full min-h-[520px] items-center justify-center rounded-[1.75rem] border border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-50/80">Destaque do dia</p>
                  <p className="mt-4 text-lg font-semibold text-white">Nenhum produto encontrado</p>
                  <p className="mt-2 text-sm text-blue-50/80">Tente outro termo de busca para ver os produtos reais cadastrados.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Explore por categoria</h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              {categorias.length ? `Mostrando as ${Math.min(categorias.length, 5)} principais categorias do backend.` : 'Categorias carregadas do backend.'}
            </p>
          </div>
          <Link to="/categorias" className="hidden text-sm font-semibold text-blue-700 hover:text-blue-800 sm:inline-flex">
            Ver todas
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categoriasVisiveis.map((category) => (
            <Link
              key={category.id}
              to={{ pathname: '/produtos', search: `?categoriaId=${category.id}&categoria=${encodeURIComponent(category.nome)}` }}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categoria</p>
              <p className="mt-3 text-lg font-bold text-slate-900">{category.nome}</p>
              <p className="mt-2 text-sm text-slate-500">{category.quantidade} produtos cadastrados</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition group-hover:text-blue-800">
                Ver produtos <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Destaques do CampuShop</h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">Carrossel com produtos reais em destaque na plataforma</p>
          </div>
        </div>

        {destaqueAtual ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-[56px_1fr_56px] xl:items-center">
            <button
              type="button"
              onClick={irParaAnterior}
              className="hidden h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 xl:flex"
              aria-label="Destaque anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">Produto real</span>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">{destaqueAtual.categoria}</span>
                  </div>

                  <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {destaqueAtual.nomeProduto}
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">{destaqueAtual.descricao}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span>{destaqueAtual.vendedorNome}</span>
                    {destaqueAtual.local ? <span>• {destaqueAtual.local}</span> : null}
                  </div>

                  <p className="mt-5 text-3xl font-black text-blue-700">{formatarPreco(destaqueAtual.preco)}</p>

                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      to={`/produto/${destaqueAtual.idProduto}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                    >
                      Ver produto <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <Link to={`/produto/${destaqueAtual.idProduto}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Em destaque agora</p>
                  <MediaImage src={buildProductImageUrl(destaqueAtual.idProduto)} alt={destaqueAtual.nomeProduto} fallbackLabel="Sem foto" className="mt-4 h-44 w-full rounded-[1.25rem]" imageClassName="h-44 w-full rounded-[1.25rem]" />
                  <p className="mt-4 text-sm font-semibold text-slate-700">Clique para abrir o produto cadastrado</p>
                </Link>
              </div>

              <div className="mt-6 flex justify-center gap-2">
                {destaquesFiltrados.map((item, index) => (
                  <button
                    key={item.idProduto}
                    type="button"
                    onClick={() => setIndiceDestaque(index)}
                    className={`h-2.5 rounded-full transition-all ${index === indiceDestaque ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                    aria-label={`Ir para destaque ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={irParaProximo}
              className="hidden h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 xl:flex"
              aria-label="Proximo destaque"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-10">
            <p className="text-lg font-bold text-slate-900">Nenhum destaque encontrado</p>
            <p className="mt-2 text-sm text-slate-500">Tente buscar por outro termo ou limpe a pesquisa para ver novamente todos os itens.</p>
          </div>
        )}
      </section>
    </Layout>
  )
}
