import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { products } from '@/lib/mock-data'
import { addToCart, countCartItems } from '@/lib/shop-storage'

type Produto = {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  vendedor_id: number
}

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [itensNoCarrinho, setItensNoCarrinho] = useState(0)

  useEffect(() => {
    carregarProdutos()
    setItensNoCarrinho(countCartItems())
  }, [])

  const carregarProdutos = async () => {
    try {
      setCarregando(true)
      setProdutos([
        ...products.map((item) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
          estoque: 10,
          vendedor_id: item.id,
        })),
      ])
    } catch (err: any) {
      setErro('Erro ao carregar produtos')
    } finally {
      setCarregando(false)
    }
  }

  const adicionarAoCarrinho = (produtoId: number) => {
    addToCart(produtoId, 1)
    setItensNoCarrinho(countCartItems())
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
            <div key={produto.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold mb-2 text-slate-900">{produto.nome}</h3>
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
                onClick={() => adicionarAoCarrinho(produto.id)}
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
