import { Layout } from '@/components/Layout'
import api from '@/lib/api'
import { carrinhoAPI, produtoAPI } from '@/lib/api-service'
import { saveCart } from '@/lib/shop-storage'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type ProdutoDetalhe = {
  idProduto: number
  nomeProduto: string
  descricao: string
  preco: number
  estoque: number
  status?: string
  visivelParaComprador?: boolean
  nomeVendedor?: string | null
  vendedorInstituicao?: string | null
  vendedorCidade?: string | null
}

export function ProdutoDetalhePage() {
  const { id } = useParams()
  const [produto, setProduto] = useState<ProdutoDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [adicionandoAoCarrinho, setAdicionandoAoCarrinho] = useState(false)
  const [mensagemAcao, setMensagemAcao] = useState('')

  useEffect(() => {
    const carregarProduto = async () => {
      const produtoId = Number(id)

      if (!produtoId) {
        setErro('Produto inválido.')
        setCarregando(false)
        return
      }

      try {
        setCarregando(true)
        // Usa o mesmo backend da listagem para mostrar o item correto da URL.
        const response = await produtoAPI.obterPorId(produtoId)
        const produtoNormalizado = response.data

        const produtoObj: ProdutoDetalhe = {
          idProduto: Number(produtoNormalizado.idProduto ?? produtoNormalizado.id),
          nomeProduto: produtoNormalizado.nomeProduto ?? produtoNormalizado.nome ?? 'Produto sem nome',
          descricao: produtoNormalizado.descricao ?? '',
          preco: Number(produtoNormalizado.preco ?? 0),
          estoque: Number(produtoNormalizado.estoque ?? 0),
          status: produtoNormalizado.status,
          visivelParaComprador: produtoNormalizado.visivelParaComprador,
          nomeVendedor: produtoNormalizado.nomeVendedor ?? produtoNormalizado.usuario?.nomeCompleto ?? null,
          vendedorInstituicao: produtoNormalizado.usuario?.instituicao ?? produtoNormalizado.instituicao ?? null,
          vendedorCidade: produtoNormalizado.usuario?.cidade ?? produtoNormalizado.cidade ?? null,
        }

        // Se a instituição ou cidade não vieram no payload do produto, tentamos buscar o usuário dono.
        const vendedorId = produtoNormalizado.usuario?.id ?? produtoNormalizado.vendedor_id ?? produtoNormalizado.vendedorId
        if (vendedorId && (!produtoObj.vendedorInstituicao || !produtoObj.vendedorCidade)) {
          try {
            const usuarioResp = await api.get(`/api/usuarios/${vendedorId}`)
            const usuario = usuarioResp.data ?? {}
            produtoObj.vendedorInstituicao = produtoObj.vendedorInstituicao ?? usuario.instituicao ?? usuario.instituicaoEnsino ?? null
            produtoObj.vendedorCidade = produtoObj.vendedorCidade ?? usuario.cidade ?? usuario.localidade ?? null
            produtoObj.nomeVendedor = produtoObj.nomeVendedor ?? usuario.nomeCompleto ?? usuario.nome ?? produtoObj.nomeVendedor
          } catch (userErr) {
            // Se não conseguir, não bloqueia a renderização — já temos dados mínimos.
            console.debug('Não foi possível buscar dados do vendedor:', userErr)
          }
        }

        setProduto(produtoObj)
      } catch (err) {
        console.error('Erro ao carregar produto:', err)
        setErro('Não foi possível carregar os dados deste produto.')
      } finally {
        setCarregando(false)
      }
    }

    carregarProduto()
  }, [id])

  const adicionarAoCarrinho = async () => {
    if (!produto || produto.estoque === 0 || adicionandoAoCarrinho) {
      return
    }

    try {
      setAdicionandoAoCarrinho(true)
      // Usa a mesma API da listagem para manter o carrinho sincronizado.
      await carrinhoAPI.adicionar(produto.idProduto, 1)
      const response = await carrinhoAPI.obter()
      const itens = response.data ?? []

      saveCart(
        itens.map((item) => ({
          productId: item.produto.idProduto,
          quantidade: item.quantidade,
        }))
      )

      setMensagemAcao('Produto adicionado ao carrinho.')
    } catch (err) {
      console.error('Erro ao adicionar produto ao carrinho:', err)
      setMensagemAcao('Não foi possível adicionar o produto ao carrinho.')
    } finally {
      setAdicionandoAoCarrinho(false)
    }
  }

  if (carregando) {
    return (
      <Layout>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-slate-500">Carregando produto...</p>
        </section>
      </Layout>
    )
  }

  if (erro || !produto) {
    return (
      <Layout>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-red-600">{erro || 'Produto não encontrado.'}</p>
          <Link to="/produtos" className="mt-4 inline-block font-semibold text-slate-700 transition hover:text-blue-700">
            ← Voltar aos produtos
          </Link>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/produtos" className="mt-2 inline-block font-semibold text-slate-700 transition hover:text-blue-700">← Voltar aos produtos</Link>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          <div>
            {/* Mantém a área visual da imagem, mas sem inventar metadados que não vêm da API. */}
            <div className="flex h-80 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400">
              Imagem principal
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
              <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
              <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
            </div>
          </div>

          <div>
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">produto</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{produto.nomeProduto}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Mostra apenas dados confirmados pelo backend; o restante foi removido para evitar informação falsa. */}
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {produto.estoque > 0 ? 'Disponível' : 'Fora de estoque'}
              </span>
              <span className="text-xs text-slate-500">ID {produto.idProduto}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <p className="text-3xl font-black text-blue-700 sm:text-4xl">R$ {produto.preco.toFixed(2)}</p>
              <p className="pb-1 text-sm font-semibold text-slate-400">{produto.estoque} em estoque</p>
            </div>

            <div className="mt-6 space-y-3">
              {/* Dispara a inclusão no carrinho e bloqueia cliques repetidos durante a requisição. */}
              <button
                type="button"
                onClick={adicionarAoCarrinho}
                disabled={produto.estoque === 0 || adicionandoAoCarrinho}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {adicionandoAoCarrinho ? 'Adicionando...' : produto.estoque === 0 ? 'Fora de estoque' : 'Adicionar ao carrinho'}
              </button>
            </div>

            {mensagemAcao && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {mensagemAcao}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Entrega e retirada devem ser combinadas diretamente com o vendedor.
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-900">Vendedor</h3>
              <p className="mt-1 font-semibold text-slate-800">{produto.nomeVendedor || 'Vendedor não informado'}</p>
              <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                <span>{produto.vendedorCidade || 'Localidade não informada'}</span>
                <span className="font-semibold">{produto.vendedorInstituicao || 'Instituição não informada'}</span>
              </div>
              <div className="mt-3 text-xs text-slate-600">Dados disponibilizados pelo proprietário do anúncio</div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 p-5 sm:p-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Descrição do produto</h2>
          <p className="mt-3 text-slate-700">{produto.descricao || 'Sem descrição informada.'}</p>
          <ul className="mt-4 list-inside list-disc text-sm text-slate-700">
            <li>Informações exibidas diretamente do backend</li>
            <li>Recarregue a página se o produto tiver sido atualizado recentemente</li>
            <li>O restante dos dados depende do cadastro completo no sistema</li>
          </ul>
        </div>
      </section>
    </Layout>
  )
}
