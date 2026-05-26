import { Layout } from '@/components/Layout'
<<<<<<< Updated upstream
import { categoriaAPI, produtoAPI } from '@/lib/api-service'
import { categories, products } from '@/lib/mock-data'
=======
import { MediaImage } from '@/components/MediaImage'
import { categoriaAPI, produtoAPI } from '@/lib/api-service'
import { buildProductImageUrl } from '@/lib/image-utils'
>>>>>>> Stashed changes
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
    produto.nomeCategoria ??
    categoriaObjeto?.nome_categoria ??
    categoriaObjeto?.nome ??
    (typeof produto.categoria === 'string' ? produto.categoria : '')

  const categoriaIdBruto = produto.categoriaId ?? categoriaObjeto?.idCategoria ?? categoriaObjeto?.id
  const categoriaId = Number(categoriaIdBruto)

  return {
    idProduto: Number(produto.idProduto ?? produto.id),
    nomeProduto: produto.nomeProduto ?? produto.nome ?? '',
    descricao: produto.descricao ?? '',
    preco: Number(produto.preco ?? 0),
    vendedorNome:
      produto.nomeVendedor ??
      produto.vendedorNome ??
      produto.usuario?.nomeCompleto ??
      produto.usuario?.nomeCliente ??
      'Vendedor do campus',
    local: produto.local ?? produto.cidade ?? produto.instituicao ?? '',
    categoriaId: Number.isFinite(categoriaId) && categoriaId > 0 ? categoriaId : undefined,
    categoria: categoriaNome || 'Sem categoria',
  }
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
  if (!categoriasApi.length) {
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

<<<<<<< Updated upstream
  // Produtos remotos e categorias remotas (fazer fetch do backend quando disponível)
  const [remoteProducts, setRemoteProducts] = useState<any[]>([])
  const [remoteCategories, setRemoteCategories] = useState<any[]>([])

  // Normaliza lista de produtos (mock ou remoto) para um formato comum usado pela UI
  const normalizeProducts = (list: any[]) =>
    (list ?? []).map((p) => ({
      id: Number(p.idProduto ?? p.id ?? 0),
      nome: p.nomeProduto ?? p.nome ?? 'Produto sem nome',
      descricao: p.descricao ?? '',
      preco: Number(p.preco ?? p.precoOriginal ?? 0),
      vendedor: p.nomeVendedor ?? p.vendedorNome ?? p.vendedor ?? p.usuario?.nomeCompleto ?? '',
      local: p.local ?? p.cidade ?? '',
    }))

  const produtosNormalizados = normalizeProducts(remoteProducts)

  // Constrói destaques APENAS com produtos reais do backend
  // Cada produto real vira um item de destaque
  const destaques: DestaqueItem[] = produtosNormalizados.map((product) => ({
    id: `produto-${product.id}`,
    tipo: 'Produto' as const,
    titulo: product.nome,
    descricao: product.descricao,
    categoria: product.categoria || 'Sem categoria',
    precoLabel: `R$ ${product.preco.toFixed(2).replace('.', ',')}`,
    vendedor: product.vendedor,
    local: product.local,
    link: `/produto/${product.id}`,
  }))

  // Destaque do dia: sempre o primeiro produto real disponível
  const destaqueDoDiaProdutos = produtosNormalizados.slice(0, 2)

  // Buscar do backend o que for possível para garantir consistência com o banco
  useEffect(() => {
    let mounted = true

    const carregar = async () => {
      try {
        const [prodResp, catResp] = await Promise.all([produtoAPI.listarTodos(), categoriaAPI.listar()])
        if (!mounted) return
        setRemoteProducts(prodResp.data ?? [])
        setRemoteCategories(catResp.data ?? [])
      } catch (err) {
        console.warn('Falha ao carregar produtos/categorias do backend, usando mock:', err)
      }
    }

    carregar()

    return () => {
      mounted = false
    }
  }, [])

  const destaquesFiltrados = destaques.filter((item) => {
    if (!termoBusca) {
      return true
=======
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
            ? (produtosResponse.value.data ?? []).map(normalizarProduto).filter((produto: ProdutoHome) => Boolean(produto.idProduto))
            : []

        const categoriasNormalizadas =
          categoriasResponse.status === 'fulfilled'
            ? normalizarCategorias(categoriasResponse.value.data ?? [], produtosNormalizados)
            : agruparCategorias(produtosNormalizados)

        if (!ativo) {
          return
        }

        if (produtosResponse.status !== 'fulfilled' && categoriasResponse.status !== 'fulfilled') {
          setErro('Não foi possível carregar os dados reais da home.')
        }

        setProdutos(produtosNormalizados)
        setCategorias(categoriasNormalizadas)
      } catch (error) {
        if (ativo) {
          console.error('Erro ao carregar a home:', error)
          setErro('Não foi possível carregar os dados reais da home.')
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
>>>>>>> Stashed changes
    }

    carregarDados()

    return () => {
      ativo = false
    }
  }, [])

  const termoBusca = busca.trim().toLowerCase()

  const destaquesFiltrados = useMemo(() => {
    const base = produtos.slice(0, 8)

    if (!termoBusca) {
      return base
    }

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

  const irParaAnterior = () => {
    if (!destaquesFiltrados.length) {
      return
    }

    setIndiceDestaque((atual) => (atual - 1 + destaquesFiltrados.length) % destaquesFiltrados.length)
  }

  const irParaProximo = () => {
    if (!destaquesFiltrados.length) {
      return
    }

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
              <Link
                to={busca.trim() ? { pathname: '/produtos', search: `?busca=${encodeURIComponent(busca.trim())}` } : '/produtos'}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.01]"
              >
                Explorar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-3 text-sm text-blue-50/80">
              {termoBusca
                ? `${destaquesFiltrados.length} resultado${destaquesFiltrados.length === 1 ? ' encontrado' : 's'} para "${busca.trim()}"`
                : 'Os destaques abaixo vêm dos produtos cadastrados no backend.'}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Star, title: `${produtos.length} produtos`, text: 'Itens reais cadastrados na plataforma.' },
                { icon: Truck, title: `${categorias.length} categorias`, text: 'Categorias vindas do backend.' },
                { icon: ShieldCheck, title: 'Acesso direto', text: 'Clique e vá para o produto ou categoria.' },
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
<<<<<<< Updated upstream
            <div className="relative flex h-full flex-col justify-between rounded-[1.75rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl lg:min-h-[520px]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-50/80">Destaque do dia</p>

                {/* Se existirem produtos no mock, exibir o primeiro como destaque (fallback) */}
                {destaqueDoDiaProdutos.length > 0 ? (
                  // Tornar o card clicavel apontando para a pagina de detalhe do produto
                  <Link to={`/produto/${destaqueDoDiaProdutos[0].id}`} className="mt-4 block rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-2xl shadow-black/10 hover:shadow-lg">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <span>Produto em destaque</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Disponível</span>
                    </div>

                    {/* Mostra a imagem/preview do primeiro produto */}
                    <div className="mt-4 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center text-slate-500">
                      Preview: {destaqueDoDiaProdutos[0].nome}
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold">{destaqueDoDiaProdutos[0].nome}</p>
                        <p className="text-sm text-slate-500">{destaqueDoDiaProdutos[0].vendedor} • {destaqueDoDiaProdutos[0].local}</p>
                      </div>
                      <p className="text-2xl font-black text-blue-700">R$ {destaqueDoDiaProdutos[0].preco}</p>
                    </div>

                    {/* Se houver um segundo produto, mostrar um resumo adicional abaixo como alternativa */}
                    {destaqueDoDiaProdutos.length > 1 && (
                      <div className="mt-4 rounded-lg border border-slate-100 bg-white p-3 text-sm text-slate-600">
                        <p className="font-semibold">Outro destaque</p>
                        <Link to={`/produto/${destaqueDoDiaProdutos[1].id}`} className="mt-1 inline-block text-slate-700 hover:text-blue-700">{destaqueDoDiaProdutos[1].nome} — R$ {destaqueDoDiaProdutos[1].preco}</Link>
                      </div>
                    )}
                  </Link>
                ) : (
                  // Nenhum produto cadastrado: orientar o usuário a explorar ou cadastrar
                  <div className="mt-4 rounded-[1.5rem] bg-white p-6 text-slate-700 shadow-sm">
                    <p className="font-semibold">Nenhum produto cadastrado ainda</p>
                    <p className="mt-2 text-sm text-slate-500">Visite a lista de produtos ou cadastre um novo item para aparecer aqui.</p>
                    <div className="mt-4 flex gap-3">
                      <Link to="/produtos" className="inline-block rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Ver produtos</Link>
                      <Link to="/cadastrar-produto" className="inline-block rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cadastrar produto</Link>
                    </div>
=======
            {destaqueAtual ? (
              <div className="relative flex h-full flex-col justify-between rounded-[1.75rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl lg:min-h-[520px]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-50/80">Destaque do dia</p>
                  <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/20 bg-white p-4 text-slate-900 shadow-2xl shadow-black/10">
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
                        <p className="text-sm text-slate-500">{destaqueAtual.vendedorNome}{destaqueAtual.local ? ` • ${destaqueAtual.local}` : ''}</p>
                      </div>
                      <p className="text-2xl font-black text-blue-700">{formatarPreco(destaqueAtual.preco)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                    <p className="text-2xl font-black">{categorias.length}</p>
                    <p className="text-blue-50/80">Categorias</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                    <p className="text-2xl font-black">{produtos.length}</p>
                    <p className="text-blue-50/80">Produtos</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                    <p className="text-2xl font-black">{destaquesFiltrados.length}</p>
                    <p className="text-blue-50/80">Visíveis na busca</p>
>>>>>>> Stashed changes
                  </div>
                )}
              </div>
<<<<<<< Updated upstream

                <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  {/* Mostrar a quantidade real de categorias cadastradas (remota quando disponível) */}
                  <p className="text-2xl font-black">{remoteCategories.length || categories.length}</p>
                  <p className="text-blue-50/80">Categorias</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">48h</p>
                  <p className="text-blue-50/80">Resposta média</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">100%</p>
                  <p className="text-blue-50/80">Campus local</p>
=======
            ) : (
              <div className="relative flex h-full min-h-[520px] items-center justify-center rounded-[1.75rem] border border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-50/80">Destaque do dia</p>
                  <p className="mt-4 text-lg font-semibold text-white">Nenhum produto encontrado</p>
                  <p className="mt-2 text-sm text-blue-50/80">Tente outro termo de busca para ver os produtos reais cadastrados.</p>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {(remoteCategories.length > 0 ? remoteCategories : categories).map((category: any) => {
            // Calcular dinamicamente quantos produtos pertencem a essa categoria
            // usando os produtos reais do backend
            const nomeCategoriaBackend = category.nomeCategoria || category.nome || ''
            const produtosNaCategoria = produtosNormalizados.filter(
              (p) => (p.categoria || '').toLowerCase() === nomeCategoriaBackend.toLowerCase()
            ).length

            return (
              <Link key={category.id} to="/categorias" className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${category.color || 'bg-slate-100'}`}>
                  {category.icon}
                </div>
                <p className="mt-4 font-bold text-slate-900">{nomeCategoriaBackend}</p>
                <p className="mt-1 text-xs text-slate-500">{produtosNaCategoria} {produtosNaCategoria === 1 ? 'produto' : 'produtos'}</p>
              </Link>
            )
          })}
=======
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
>>>>>>> Stashed changes
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Destaques do CampusShop</h2>
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

                  <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                    {destaqueAtual.descricao}
                  </p>

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
                  <MediaImage
                    src={buildProductImageUrl(destaqueAtual.idProduto)}
                    alt={destaqueAtual.nomeProduto}
                    fallbackLabel="Sem foto"
                    className="mt-4 h-44 w-full rounded-[1.25rem]"
                    imageClassName="h-44 w-full rounded-[1.25rem]"
                  />
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
            <p className="mt-2 text-sm text-slate-500">
              Tente buscar por outro termo ou limpe a pesquisa para ver novamente todos os itens.
            </p>
          </div>
        )}
      </section>
    </Layout>
  )
}