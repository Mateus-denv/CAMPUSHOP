import { Layout } from '@/components/Layout'
import { MediaImage } from '@/components/MediaImage'
import api from '@/lib/api'
import { carrinhoAPI, produtoAPI, type ProdutoAPI, type ProdutoVarianteAPI } from '@/lib/api-service'
import { saveCart } from '@/lib/shop-storage'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  possuiVariantes?: boolean
  nomeVendedor?: string | null
  vendedorInstituicao?: string | null
  vendedorCidade?: string | null
  produtoPaiId?: number | null
  produtoPaiNome?: string | null
  variantes?: ProdutoVarianteAPI[]
}

type ImagemProduto = {
  id: number
  nomeArquivo: string
  contentType: string
  url: string
  dataUpload?: string | null
}

export function ProdutoDetalhePage() {
  const { id } = useParams()
  const [produto, setProduto] = useState<ProdutoDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [adicionandoAoCarrinho, setAdicionandoAoCarrinho] = useState(false)
  const [mensagemAcao, setMensagemAcao] = useState('')
  const [imagens, setImagens] = useState<ImagemProduto[]>([])
  const [indiceImagemAtual, setIndiceImagemAtual] = useState(0)
  const [varianteSelecionadaId, setVarianteSelecionadaId] = useState<number | null>(null)

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
        const produtoNormalizado: ProdutoAPI = response.data

        const produtoObj: ProdutoDetalhe = {
          idProduto: Number(produtoNormalizado.idProduto ?? produtoNormalizado.id),
          nomeProduto: produtoNormalizado.nomeProduto ?? produtoNormalizado.nome ?? 'Produto sem nome',
          descricao: produtoNormalizado.descricao ?? '',
          preco: Number(produtoNormalizado.preco ?? 0),
          estoque: Number(produtoNormalizado.estoque ?? 0),
          status: produtoNormalizado.status,
          visivelParaComprador: produtoNormalizado.visivelParaComprador,
          possuiVariantes: Boolean(produtoNormalizado.possuiVariantes),
          nomeVendedor: produtoNormalizado.nomeVendedor ?? produtoNormalizado.usuario?.nomeCompleto ?? null,
          vendedorInstituicao: produtoNormalizado.usuario?.instituicao ?? produtoNormalizado.instituicao ?? null,
          vendedorCidade: produtoNormalizado.usuario?.cidade ?? produtoNormalizado.cidade ?? null,
          produtoPaiId: produtoNormalizado.produtoPaiId ?? null,
          produtoPaiNome: produtoNormalizado.produtoPaiNome ?? null,
          variantes: produtoNormalizado.variantes ?? [],
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
        setVarianteSelecionadaId((produtoObj.variantes?.find((variante) => variante.estoque > 0)?.idProduto) ?? null)

        try {
          const imagensResponse = await produtoAPI.listarImagens(produtoId)
          setImagens(imagensResponse.data ?? [])
        } catch (imageErr) {
          console.debug('Nenhuma imagem de produto foi carregada:', imageErr)
          setImagens([])
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err)
        setErro('Não foi possível carregar os dados deste produto.')
      } finally {
        setCarregando(false)
      }
    }

    carregarProduto()
  }, [id])

  useEffect(() => {
    if (indiceImagemAtual >= imagens.length) {
      setIndiceImagemAtual(0)
    }
  }, [imagens, indiceImagemAtual])

  // Carrega imagens da variante selecionada. Faz fallback para as imagens do produto pai se a variante não
  // tiver imagens cadastradas. Isso garante que ao selecionar uma variante a galeria mostre a foto correta.
  useEffect(() => {
    const carregarImagensDaVariante = async () => {
      if (!produto) return

      const alvoId = varianteSelecionadaId ?? produto.idProduto
      try {
        const resp = await produtoAPI.listarImagens(alvoId)
        setImagens(resp.data ?? [])
        setIndiceImagemAtual(0)
      } catch (err) {
        // Se não houver imagens para a variante, tenta carregar as do anúncio pai
        if (alvoId !== produto.idProduto) {
          try {
            const resp2 = await produtoAPI.listarImagens(produto.idProduto)
            setImagens(resp2.data ?? [])
            setIndiceImagemAtual(0)
          } catch (err2) {
            setImagens([])
          }
        } else {
          setImagens([])
        }
      }
    }

    carregarImagensDaVariante()
  }, [varianteSelecionadaId, produto])

  const temGaleria = imagens.length > 0
  const imagemAtual = temGaleria ? imagens[indiceImagemAtual] : null

  const irParaImagemAnterior = () => {
    if (!temGaleria) {
      return
    }

    setIndiceImagemAtual((atual) => (atual - 1 + imagens.length) % imagens.length)
  }

  const irParaProximaImagem = () => {
    if (!temGaleria) {
      return
    }

    setIndiceImagemAtual((atual) => (atual + 1) % imagens.length)
  }

  const produtoParaCarrinho = produto?.possuiVariantes
    ? produto?.variantes?.find((variante) => variante.idProduto === varianteSelecionadaId)
    : produto

  const adicionarAoCarrinho = async () => {
    if (!produto || !produtoParaCarrinho || adicionandoAoCarrinho) {
      return
    }

    if (produto.possuiVariantes && produtoParaCarrinho.estoque === 0) {
      return
    }

    try {
      setAdicionandoAoCarrinho(true)
      // Usa a mesma API da listagem para manter o carrinho sincronizado.
      await carrinhoAPI.adicionar(produtoParaCarrinho.idProduto, 1)
      const response = await carrinhoAPI.obter()
      const itens = response.data ?? []

      saveCart(
        itens.map((item) => ({
          productId: item.produto.idProduto,
          quantidade: item.quantidade,
        }))
      )

      setMensagemAcao(produto.possuiVariantes ? 'Variante adicionada ao carrinho.' : 'Produto adicionado ao carrinho.')
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
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <button
                type="button"
                onClick={irParaImagemAnterior}
                disabled={!temGaleria}
                className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-lg shadow-slate-900/10 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={irParaProximaImagem}
                disabled={!temGaleria}
                className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-lg shadow-slate-900/10 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={irParaProximaImagem}
                disabled={!temGaleria}
                className="block w-full text-left disabled:cursor-not-allowed"
                aria-label="Avançar imagem"
              >
                <MediaImage
                  src={imagemAtual?.url || `/api/produtos/${produto.idProduto}/imagens/principal`}
                  alt={imagemAtual?.nomeArquivo || produto.nomeProduto}
                  fallbackLabel="Sem imagem cadastrada"
                  className="h-80 w-full rounded-[1.75rem]"
                  imageClassName="h-80 w-full rounded-[1.75rem]"
                />
              </button>
            </div>

            {imagens.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {imagens.slice(0, 4).map((imagem, index) => (
                  <button
                    key={imagem.id}
                    type="button"
                    onClick={() => setIndiceImagemAtual(index)}
                    className={`overflow-hidden rounded-2xl border transition ${index === indiceImagemAtual ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                    aria-label={`Ver imagem ${index + 1}`}
                  >
                    <MediaImage
                      src={imagem.url}
                      alt={imagem.nomeArquivo}
                      fallbackLabel="Imagem"
                      className="h-24 w-full"
                      imageClassName="h-24 w-full rounded-2xl"
                    />
                  </button>
                ))}
              </div>
            ) : null}
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
              <p className="text-3xl font-black text-blue-700 sm:text-4xl">
                {produto.possuiVariantes ? 'A partir de ' : ''}R$ {produto.preco.toFixed(2)}
              </p>
              <p className="pb-1 text-sm font-semibold text-slate-400">
                {produto.possuiVariantes ? `${produto.variantes?.length ?? 0} variante(s)` : `${produto.estoque} em estoque`}
              </p>
            </div>

            {produto.possuiVariantes && produto.variantes?.length ? (
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-lg font-black text-slate-900">Escolha uma variante</h3>
                <p className="mt-1 text-sm text-slate-600">O carrinho recebe a variante selecionada e não o anúncio principal.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {produto.variantes.map((variante) => {
                    const selecionada = varianteSelecionadaId === variante.idProduto
                    return (
                      <button
                        key={variante.idProduto}
                        type="button"
                        onClick={() => setVarianteSelecionadaId(variante.idProduto)}
                        disabled={variante.estoque === 0}
                        className={`rounded-2xl border p-4 text-left transition ${selecionada ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                              <p className="font-bold text-slate-900">{variante.nomeProduto}</p>
                              {variante.descricaoVariacao ? (
                                <p className="mt-1 text-sm text-slate-500">{variante.descricaoVariacao}</p>
                              ) : (
                                <p className="mt-1 text-sm text-slate-500">{variante.estoque} em estoque</p>
                              )}
                          </div>
                              <span className="text-lg font-black text-blue-700">R$ {Number(variante.preco).toFixed(2)}</span>
                        </div>
                        {variante.estoque === 0 ? (
                          <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Indisponível</span>
                        ) : selecionada ? (
                          <span className="mt-3 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Selecionada</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              {/* Dispara a inclusão no carrinho e bloqueia cliques repetidos durante a requisição. */}
              <button
                type="button"
                onClick={adicionarAoCarrinho}
                disabled={adicionandoAoCarrinho || !produtoParaCarrinho || (produto.possuiVariantes ? produtoParaCarrinho.estoque === 0 : produto.estoque === 0)}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {adicionandoAoCarrinho
                  ? 'Adicionando...'
                  : produto.possuiVariantes
                    ? !produtoParaCarrinho
                      ? 'Selecione uma variante'
                      : produtoParaCarrinho.estoque === 0
                        ? 'Variante indisponível'
                        : 'Adicionar variante ao carrinho'
                    : produto.estoque === 0
                      ? 'Fora de estoque'
                      : 'Adicionar ao carrinho'}
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
          {produto.possuiVariantes ? (
            <p className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              Este anúncio possui variantes. A compra acontece pela opção selecionada acima.
            </p>
          ) : null}
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
