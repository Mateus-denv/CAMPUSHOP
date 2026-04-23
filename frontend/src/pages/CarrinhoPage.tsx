import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { produtoAPI } from '@/lib/api-service'
import { products } from '@/lib/mock-data'
import { cacheProduct, createOrderFromCart, getCachedProduct, getCart, removeFromCart, updateCartItem } from '@/lib/shop-storage'

type ApiProduct = {
  idProduto: number
  nomeProduto: string
  descricao: string
  preco: number
  estoque: number
  vendedor?: string
}

export function CarrinhoPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(getCart())
  const [modalChat, setModalChat] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [produtosApi, setProdutosApi] = useState<ApiProduct[]>([])

  // Evita inventar nome de vendedor; a tela só mostra o nome real ou um texto neutro.
  const resolverNomeVendedor = (nome?: string) => nome?.trim() || 'Sem vendedor informado'

  // Detecta valores legados para deixar a API sobrescrever o nome quando existir.
  const vendedorEhLegado = (nome?: string) => {
    const normalizado = resolverNomeVendedor(nome)
    return normalizado === 'Sem vendedor informado' || normalizado === 'Vendedor CampusShop'
  }

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const response = await produtoAPI.listarTodos()
        // Normaliza possíveis formatos de vendedor vindos do backend.
        const normalizados: ApiProduct[] = (response.data ?? []).map((produto: any) => ({
          idProduto: Number(produto.idProduto ?? produto.id),
          nomeProduto: produto.nomeProduto ?? produto.nome ?? '',
          descricao: produto.descricao ?? '',
          preco: Number(produto.preco ?? 0),
          estoque: Number(produto.estoque ?? 0),
          vendedor:
            produto.nomeVendedor ??
            produto.vendedor ??
            produto.usuario?.nomeCompleto ??
            produto.usuario?.nomeCliente ??
            undefined,
        }))
        setProdutosApi(normalizados)
      } catch {
        setProdutosApi([])
      }
    }

    carregarProdutos()
  }, [])

  useEffect(() => {
    // Atualiza o cache local quando o nome real do vendedor chegar pela API.
    cart.forEach((item) => {
      const cached = getCachedProduct(item.productId)
      const apiProduct = produtosApi.find((produto) => produto.idProduto === item.productId)

      if (!cached || !apiProduct) {
        return
      }

      const nomeVendedorApi = apiProduct.vendedor?.trim()
      const vendedorAtual = cached.vendedor?.trim()

      if (nomeVendedorApi && vendedorEhLegado(vendedorAtual)) {
        cacheProduct({
          ...cached,
          vendedor: nomeVendedorApi,
        })
      }
    })
  }, [cart, produtosApi])

  const cartWithProducts = useMemo(
    () =>
      cart
        .map((item) => {
          const cached = getCachedProduct(item.productId)
          const apiProduct = produtosApi.find((produto) => produto.idProduto === item.productId)
          const product = cached
            ? {
              id: cached.id,
              nome: apiProduct?.nomeProduto || cached.nome,
              descricao: apiProduct?.descricao || cached.descricao,
              categoria: 'Marketplace',
              condicao: cached.condicao ?? 'Novo',
              preco: apiProduct?.preco ?? cached.preco,
              // Prioriza o vendedor real da API e, se não existir, usa o texto neutro.
              vendedor: resolverNomeVendedor(vendedorEhLegado(cached.vendedor) ? apiProduct?.vendedor : cached.vendedor),
              local: 'Campus',
            }
            : apiProduct
              ? {
                id: apiProduct.idProduto,
                nome: apiProduct.nomeProduto || 'Produto sem nome',
                descricao: apiProduct.descricao,
                categoria: 'Marketplace',
                condicao: 'Novo',
                preco: apiProduct.preco,
                // Mostra o nome real do vendedor quando a API o disponibiliza.
                vendedor: resolverNomeVendedor(apiProduct.vendedor),
                local: 'Campus',
              }
              : products.find((p) => p.id === item.productId)

          if (!product) {
            return null
          }
          return { productId: item.productId, product, quantidade: item.quantidade }
        })
        .filter((item): item is { productId: number; product: (typeof products)[number]; quantidade: number } => item !== null),
    [cart, produtosApi]
  )

  const total = cartWithProducts.reduce((acc, item) => acc + item.product.preco * item.quantidade, 0)

  const atualizarQuantidade = (productId: number, quantidade: number) => {
    updateCartItem(productId, quantidade)
    setCart(getCart())
  }

  const excluirItem = (productId: number) => {
    removeFromCart(productId)
    setCart(getCart())
  }

  const finalizarPedido = () => {
    const pedido = createOrderFromCart()
    if (!pedido) {
      setMensagem('Adicione produtos no carrinho antes de finalizar.')
      return
    }
    setMensagem(`Pedido ${pedido.id} criado com sucesso!`)
    setCart(getCart())
    setTimeout(() => navigate('/pedidos'), 700)
  }

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6">
          <Link to="/produtos" className="text-sm font-semibold text-slate-600 transition hover:text-blue-700">← Continuar comprando</Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Meu carrinho</h1>
          <p className="mt-2 text-sm text-slate-500">{cartWithProducts.length} produtos no seu carrinho</p>
          {mensagem && <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">{mensagem}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartWithProducts.length === 0 && (
              <div className="rounded-[1.5rem] border border-slate-200 p-6 text-center">
                <p className="font-semibold text-slate-700">Seu carrinho está vazio.</p>
                <Link to="/produtos" className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Ver produtos
                </Link>
              </div>
            )}

            {cartWithProducts.map(({ productId, product: p, quantidade: q }) => (
              <div key={productId} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 p-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-2xl sm:w-24">📦</div>
                <div className="flex-1">
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">{p.condicao}</span>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{p.nome}</h3>
                  <p className="text-sm text-slate-500">Vendido por: {p.vendedor}</p>
                  <p className="mt-2 text-2xl font-black text-blue-700">R$ {p.preco.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button onClick={() => atualizarQuantidade(productId, Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50">−</button>
                  <span className="w-8 text-center font-semibold text-slate-700">{q}</span>
                  <button onClick={() => atualizarQuantidade(productId, q + 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50">+</button>
                  <button onClick={() => excluirItem(productId)} className="ml-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">Remover</button>
                </div>
              </div>
            ))}

            <h2 className="mt-8 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Você também pode gostar</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex h-36 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 font-semibold text-slate-400">
                  Produto Recomendado
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Resumo do pedido</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>Subtotal ({cartWithProducts.length} itens)</span><strong>R$ {total.toFixed(2)}</strong></div>
                <div className="flex justify-between"><span>Entrega</span><span>A negociar</span></div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <strong className="text-lg text-slate-900">Total</strong>
                <strong className="text-xl text-blue-700">R$ {total.toFixed(2)}</strong>
              </div>
              <button onClick={finalizarPedido} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-[1.01]">Finalizar pedido</button>
              <button onClick={() => setModalChat(true)} className="mt-3 w-full rounded-2xl border border-slate-200 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50">Conversar com vendedor</button>
              <button className="mt-3 w-full rounded-2xl border border-slate-200 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50">Salvar para depois</button>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 p-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">🛍️</div>
              <p className="mt-2 font-bold text-slate-900">Compra segura</p>
              <p className="mt-1 text-xs text-slate-500">Negocie com estudantes e combine entrega com facilidade.</p>
            </div>
          </div>
        </div>
      </section>

      {modalChat && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Escolha com qual vendedor deseja conversar</h3>
                <p className="mt-1 text-sm text-slate-500">Você possui produtos de diferentes vendedores.</p>
              </div>
              <button onClick={() => setModalChat(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-slate-500 transition hover:bg-slate-50">✕</button>
            </div>
            <div className="mt-5 space-y-3">
              <button onClick={() => navigate('/chat')} className="w-full rounded-[1.5rem] border border-slate-200 p-4 text-left transition hover:bg-slate-50">
                <p className="font-bold text-slate-900">João Silva <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">UFBA</span></p>
                <p className="text-sm text-slate-500">Livro de lógica de programação - R$ 150,00</p>
              </button>
              <button onClick={() => navigate('/chat')} className="w-full rounded-[1.5rem] border border-slate-200 p-4 text-left transition hover:bg-slate-50">
                <p className="font-bold text-slate-900">Maria Lima <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">UFBA</span></p>
                <p className="text-sm text-slate-500">Empada Doce - R$ 10,00</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}