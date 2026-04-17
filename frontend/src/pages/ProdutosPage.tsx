import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { produtoAPI } from '@/lib/api-service'
import { addToCartWithSnapshot, countCartItems, isFavorite, toggleFavorite } from '@/lib/shop-storage'
import { Heart } from 'lucide-react'

type Produto = {
  idProduto: number
  nomeProduto: string
  descricao: string
  preco: number
  estoque: number
  vendedor_id?: number
}

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [itensNoCarrinho, setItensNoCarrinho] = useState(0)
  const [notificacao, setNotificacao] = useState('')
  const [favoritos, setFavoritos] = useState<number[]>([])

  useEffect(() => {
    carregarProdutos()
    setItensNoCarrinho(countCartItems())
  }, [])

  useEffect(() => {
    const idsFavoritos = produtos.map((produto) => produto.idProduto).filter((id) => isFavorite(id))
    setFavoritos(idsFavoritos)
  }, [produtos])

  const carregarProdutos = async () => {
    try {
      setCarregando(true)
      const response = await produtoAPI.listarTodos()
      const produtosNormalizados: Produto[] = (response.data ?? []).map((produto: any) => ({
        idProduto: Number(produto.idProduto ?? produto.id),
        nomeProduto: produto.nomeProduto ?? produto.nome ?? '',
        descricao: produto.descricao ?? '',
        preco: Number(produto.preco ?? 0),
        estoque: Number(produto.estoque ?? 0),
        vendedor_id: produto.vendedor_id,
      }))
      setProdutos(produtosNormalizados)
    } catch (err: any) {
      setErro('Erro ao carregar produtos da API')
      console.error('Erro:', err)
    } finally {
      setCarregando(false)
    }
  }

  const adicionarAoCarrinho = (produtoId: number) => {
    const produto = produtos.find((item) => item.idProduto === produtoId)
    if (!produto) {
      return
    }

    addToCartWithSnapshot(
      {
        id: produto.idProduto,
        nome: produto.nomeProduto || 'Produto sem nome',
        descricao: produto.descricao || '',
        preco: produto.preco,
        estoque: produto.estoque,
        condicao: 'Novo',
        vendedor: 'Vendedor CampusShop',
      },
      1
    )

    setItensNoCarrinho(countCartItems())
    setNotificacao(`"${produto.nomeProduto || 'Produto'}" foi adicionado ao carrinho.`)
    setTimeout(() => setNotificacao(''), 2500)
  }

  const favoritarProduto = (produtoId: number) => {
    const produto = produtos.find((item) => item.idProduto === produtoId)
    if (!produto) {
      return
    }

    const favoritado = toggleFavorite({
      id: produto.idProduto,
      nome: produto.nomeProduto || 'Produto sem nome',
      descricao: produto.descricao || '',
      preco: produto.preco,
      estoque: produto.estoque,
      categoria: 'Marketplace',
    })

    setFavoritos((atual) =>
      favoritado ? [produtoId, ...atual.filter((id) => id !== produtoId)] : atual.filter((id) => id !== produtoId)
    )

    setNotificacao(
      favoritado
        ? `"${produto.nomeProduto || 'Produto'}" foi adicionado aos favoritos.`
        : `"${produto.nomeProduto || 'Produto'}" foi removido dos favoritos.`
    )
    setTimeout(() => setNotificacao(''), 2500)
  }

  if (carregando) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Carregando produtos...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        {notificacao && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {notificacao}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold">Produtos</h1>
          <Link to="/carrinho" className="inline-flex w-fit items-center rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50">
            Ir para carrinho ({itensNoCarrinho})
          </Link>
        </div>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <div key={produto.idProduto} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-slate-900">{produto.nomeProduto || 'Produto sem nome'}</h3>
                <button
                  type="button"
                  onClick={() => favoritarProduto(produto.idProduto)}
                  className={`rounded-xl border px-2.5 py-2 transition ${favoritos.includes(produto.idProduto)
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  aria-label="Favoritar produto"
                >
                  <Heart className={`h-4 w-4 ${favoritos.includes(produto.idProduto) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className="text-slate-600 text-sm mb-4">{produto.descricao}</p>

              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-blue-700">
                  R$ {produto.preco.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500">
                  {produto.estoque} em estoque
                </span>
              </div>

              <button
                onClick={() => adicionarAoCarrinho(produto.idProduto)}
                disabled={produto.estoque === 0}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {produto.estoque === 0 ? 'Fora de estoque' : 'Adicionar ao carrinho'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
