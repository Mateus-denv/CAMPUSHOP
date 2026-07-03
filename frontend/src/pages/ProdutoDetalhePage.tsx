import { Layout } from '@/components/Layout'
import { MediaImage } from '@/components/MediaImage'
import api from '@/lib/api'
import { avaliacaoAPI, carrinhoAPI, produtoAPI, type AvaliacaoAPI, type ProdutoAPI, type ProdutoVarianteAPI } from '@/lib/api-service'
import { saveCart } from '@/lib/shop-storage'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { ProductMap } from '@/components/ProductMap'

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
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAPI[]>([])
  const [notaMedia, setNotaMedia] = useState<number | null>(null)
  const [totalAvaliacoes, setTotalAvaliacoes] = useState<number>(0)
  const [notaSelecionada, setNotaSelecionada] = useState<number>(10)
  const [feedback, setFeedback] = useState('')
  const [avaliacaoEnviando, setAvaliacaoEnviando] = useState(false)
  const [erroAvaliacao, setErroAvaliacao] = useState('')
  const [podeAvaliar, setPodeAvaliar] = useState(false)
  const [motivoNaoAvaliar, setMotivoNaoAvaliar] = useState('')
  const { usuario } = useAuthStore()
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null)
  const [cidadeVendedor, setCidadeVendedor] = useState<string | null>(null)
  const [estadoVendedor, setEstadoVendedor] = useState<string | null>(null)

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

  // Tenta obter distância do vendedor quando o produto está carregado e o navegador fornece localização.
  useEffect(() => {
    if (!produto) return

    try {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const resp = await produtoAPI.proximos(pos.coords.latitude, pos.coords.longitude, 100, undefined, undefined, Number(id))
            if (resp.status === 200) {
              const info = resp.data
              // Quando produtoId for enviado, o backend retorna um objeto único
              const item = Array.isArray(info) ? info[0] : info
              if (item) {
                setDistanciaKm(item.distanciaKm ?? null)
                setCidadeVendedor(item.cidadeVendedor ?? item.cidade ?? null)
                setEstadoVendedor(item.estadoVendedor ?? item.estado ?? null)
              }
            }
          } catch (e) {
            console.debug('Erro ao obter distância do produto', e)
          }
        })
      }
    } catch (e) {
      console.debug('Geolocalização indisponível', e)
    }
  }, [produto, id])

  useEffect(() => {
    const carregarAvaliacoes = async () => {
      const produtoId = Number(id)
      if (!produtoId) {
        return
      }

      try {
        const [avaliacoesResp, mediaResp] = await Promise.all([
          avaliacaoAPI.listarPorProduto(produtoId),
          avaliacaoAPI.media(produtoId),
        ])

        setAvaliacoes(avaliacoesResp.data ?? [])
        setNotaMedia(mediaResp.data?.notaMedia ?? 0)
        setTotalAvaliacoes(mediaResp.data?.totalAvaliacoes ?? 0)
      } catch (err) {
        console.error('Erro ao carregar avaliações:', err)
      }
    }

    carregarAvaliacoes()
  }, [id, produto])

  useEffect(() => {
    const verificarPermissaoAvaliacao = async () => {
      const produtoId = Number(id)
      if (!produtoId || !usuario) {
        setPodeAvaliar(false)
        setMotivoNaoAvaliar('Faça login para avaliar este produto depois da compra.')
        return
      }

      try {
        const response = await avaliacaoAPI.podeAvaliar(produtoId)
        setPodeAvaliar(response.data.podeAvaliar)
        setMotivoNaoAvaliar(response.data.motivo ?? '')
      } catch (err) {
        console.error('Erro ao verificar permissão de avaliação:', err)
        setPodeAvaliar(false)
        setMotivoNaoAvaliar('Não foi possível verificar se você pode avaliar este produto.')
      }
    }

    verificarPermissaoAvaliacao()
  }, [id, usuario])

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
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                <Star className="h-4 w-4 text-yellow-500" />
                {notaMedia !== null ? notaMedia.toFixed(1) : '-'} / 10
              </span>
              <span className="text-slate-500">{totalAvaliacoes} avaliação{totalAvaliacoes === 1 ? '' : 'es'}</span>
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

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-black text-slate-900">Avaliações</h3>
              <p className="mt-2 text-sm text-slate-600">Compartilhe sua experiência ou veja o que outros compradores disseram.</p>

              {usuario ? (
                podeAvaliar ? (
                  <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Deixe sua avaliação</h4>
                    <div className="mt-4 flex gap-2 text-yellow-500">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((valor) => (
                        <button
                          key={valor}
                          type="button"
                          className={`rounded-full p-2 text-sm font-bold transition ${notaSelecionada >= valor ? 'bg-yellow-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                          onClick={() => setNotaSelecionada(valor)}
                        >
                          {valor}
                        </button>
                      ))}
                    </div>

                    <label className="mt-5 block text-sm font-semibold text-slate-700">Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      maxLength={500}
                      rows={4}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Conte sua experiência com o produto (máx 500 caracteres)"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{feedback.length}/500</span>
                      {erroAvaliacao ? <span className="text-red-600">{erroAvaliacao}</span> : null}
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!produto) return
                        setErroAvaliacao('')
                        setAvaliacaoEnviando(true)

                        try {
                          await avaliacaoAPI.criar(produto.idProduto, notaSelecionada, feedback)
                          const [avaliacoesResp, mediaResp, permissaoResp] = await Promise.all([
                            avaliacaoAPI.listarPorProduto(produto.idProduto),
                            avaliacaoAPI.media(produto.idProduto),
                            avaliacaoAPI.podeAvaliar(produto.idProduto),
                          ])
                          setAvaliacoes(avaliacoesResp.data ?? [])
                          setNotaMedia(mediaResp.data?.notaMedia ?? 0)
                          setTotalAvaliacoes(mediaResp.data?.totalAvaliacoes ?? 0)
                          setPodeAvaliar(permissaoResp.data.podeAvaliar)
                          setMotivoNaoAvaliar(permissaoResp.data.motivo ?? '')
                          setFeedback('')
                          setMensagemAcao('Avaliação enviada com sucesso.')
                        } catch (err: unknown) {
                          console.error('Erro ao enviar avaliação:', err)
                          setErroAvaliacao('Não foi possível enviar a avaliação. Verifique se já avaliou este produto e tente novamente.')
                        } finally {
                          setAvaliacaoEnviando(false)
                        }
                      }}
                      disabled={avaliacaoEnviando}
                      className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {avaliacaoEnviando ? 'Enviando...' : 'Enviar avaliação'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Avaliação só disponível após entrega</p>
                    <p className="mt-2 text-slate-600">{motivoNaoAvaliar || 'Você pode avaliar este produto depois que o pedido for entregue.'}</p>
                    <Link to="/pedidos" className="mt-4 inline-flex rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Ir para meus pedidos
                    </Link>
                  </div>
                )
              ) : (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
                  Faça login para enviar sua avaliação.
                </div>
              )}

              <div className="mt-6 space-y-4">
                {avaliacoes.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Nenhuma avaliação registrada para este produto.</p>
                ) : (
                  avaliacoes.map((avaliacao) => (
                    <article key={avaliacao.idAvaliacao} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{avaliacao.nomeUsuario}</span>
                        <span className="inline-flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4" />
                          {avaliacao.nota}/10
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{avaliacao.feedback || 'Sem comentário adicional.'}</p>
                      <p className="mt-3 text-xs text-slate-500">{new Date(avaliacao.dataAvaliacao).toLocaleDateString()}</p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-900">Vendedor</h3>
              <p className="mt-1 font-semibold text-slate-800">{produto.nomeVendedor || 'Vendedor não informado'}</p>
              <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                <div>
                  <div>{produto.vendedorCidade || 'Localidade não informada'}{produto.vendedorCidade && estadoVendedor ? `, ${estadoVendedor}` : ''}</div>
                  {distanciaKm ? <div className="text-xs text-slate-500">📍 {distanciaKm} km de você</div> : null}
                </div>
                <span className="font-semibold">{produto.vendedorInstituicao || 'Instituição não informada'}</span>
              </div>
              <div className="mt-3 text-xs text-slate-600">Dados disponibilizados pelo proprietário do anúncio</div>
              {/* Mapa aproximado da localidade do vendedor. Não revela endereço exato. */}
              <ProductMap cidade={cidadeVendedor ?? produto.vendedorCidade ?? null} estado={estadoVendedor ?? null} />
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
