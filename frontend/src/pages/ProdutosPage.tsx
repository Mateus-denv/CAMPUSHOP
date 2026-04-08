import { useState, useEffect } from 'react'
import { useCarrinhoStore, Produto } from '@/store'
import { Layout } from '@/components/Layout'
import { carrinhoAPI } from '@/lib/api-service'

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const { setCarrinho } = useCarrinhoStore()

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      setCarregando(true)
      // Simulação de dados - em produção viria da API
      setProdutos([
        {
          id: 1,
          nome: 'Caderno A5',
          descricao: 'Caderno pequeno para anotações',
          preco: 19.90,
          estoque: 10,
          vendedor_id: 1,
        },
        {
          id: 2,
          nome: 'Caneta Azul',
          descricao: 'Caneta esferográfica azul',
          preco: 2.50,
          estoque: 50,
          vendedor_id: 1,
        },
        {
          id: 3,
          nome: 'Mochila Escolar',
          descricao: 'Mochila grande com vários compartimentos',
          preco: 89.90,
          estoque: 5,
          vendedor_id: 2,
        },
      ])
    } catch (err: any) {
      setErro('Erro ao carregar produtos')
    } finally {
      setCarregando(false)
    }
  }

  const adicionarAoCarrinho = async (produtoId: number) => {
    try {
      await carrinhoAPI.adicionar(produtoId, 1)
      const carrinhoData = await carrinhoAPI.obter()
      setCarrinho(carrinhoData.data)
      alert('Produto adicionado ao carrinho!')
    } catch (err) {
      alert('Erro ao adicionar ao carrinho')
    }
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
        <h1 className="text-4xl font-bold mb-8">Produtos</h1>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <div key={produto.id} className="card">
              <h3 className="text-xl font-bold mb-2">{produto.nome}</h3>
              <p className="text-gray-600 text-sm mb-4">{produto.descricao}</p>

              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  R$ {produto.preco.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  {produto.estoque} em estoque
                </span>
              </div>

              <button
                onClick={() => adicionarAoCarrinho(produto.id)}
                disabled={produto.estoque === 0}
                className="w-full btn-primary"
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
