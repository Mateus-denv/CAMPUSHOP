import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { categoriaAPI, produtoAPI } from '@/lib/api-service'

type Categoria = {
  id: number
  nome: string
  descricao?: string
}

type Produto = {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  categoria: Categoria
}

export function CategoriasPage() {
  const [busca, setBusca] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas as categorias')
  const [ordenacao, setOrdenacao] = useState('Mais recente')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)

  // Carrega dados ao montar
  useEffect(() => {
    carregarDados()
  }, [])

  // Aplica filtros quando busca, categoria ou ordenação mudam
  useEffect(() => {
    aplicarFiltros()
  }, [busca, categoriaSelecionada, ordenacao, produtos])

  const carregarDados = async () => {
    try {
      setCarregando(true)
      const [categoriasRes, produtosRes] = await Promise.all([
        categoriaAPI.listar(),
        produtoAPI.listarTodos()
      ])
      setCategorias(categoriasRes.data)
      setProdutos(produtosRes.data)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setCarregando(false)
    }
  }

  const aplicarFiltros = () => {
    const termo = busca.trim().toLowerCase()

    let filtrados = produtos.filter((produto) => {
      const correspondeBusca =
        !termo ||
        produto.nome.toLowerCase().includes(termo) ||
        produto.descricao.toLowerCase().includes(termo)

      const correspondeCategoria =
        categoriaSelecionada === 'Todas as categorias' ||
        produto.categoria.nome === categoriaSelecionada

      return correspondeBusca && correspondeCategoria
    })

    if (ordenacao === 'Menor preço') {
      filtrados.sort((a, b) => a.preco - b.preco)
    } else if (ordenacao === 'Maior preço') {
      filtrados.sort((a, b) => b.preco - a.preco)
    } else {
      filtrados.sort((a, b) => b.id - a.id)
    }

    setProdutosFiltrados(filtrados)
  }

  if (carregando) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <p>Carregando categorias...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Todas as categorias</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Explore todos os produtos disponíveis</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm md:flex-row md:items-center">
          <span className="font-semibold text-slate-700">Filtros</span>
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar produtos, vendedores ou descrições"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none"
          />
          <select
            value={categoriaSelecionada}
            onChange={(event) => setCategoriaSelecionada(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none"
          >
            <option>Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id}>{categoria.nome}</option>
            ))}
          </select>
          <select
            value={ordenacao}
            onChange={(event) => setOrdenacao(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none md:ml-auto"
          >
            <option>Mais recente</option>
            <option>Menor preço</option>
            <option>Maior preço</option>
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {produtosFiltrados.map((produto) => (
            <Link key={produto.id} to={`/produto/${produto.id}`} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400">
                Imagem
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                  {produto.categoria.nome}
                </span>
                <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900 line-clamp-2">
                  {produto.nome}
                </h3>
                <p className="mt-2 text-2xl font-black text-blue-700">
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Fora de estoque'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            Nenhum produto encontrado com os filtros atuais.
          </div>
        )}
      </section>
    </Layout>
  )
}
