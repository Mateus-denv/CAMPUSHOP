import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { pedidoAPI, type PedidoAPI, type PedidoItemAPI } from '@/lib/api-service'

type PedidoEdicao = {
  idPedido: number
  endereco: string
  observacoes: string
  itens: PedidoItemAPI[]
}

const statusClasses: Record<string, string> = {
  PENDENTE: 'bg-orange-100 text-orange-700',
  CANCELADO: 'bg-red-100 text-red-700',
  ENVIADO: 'bg-blue-100 text-blue-700',
  ENTREGUE: 'bg-emerald-100 text-emerald-700',
}

export function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoAPI[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [pedidoEditando, setPedidoEditando] = useState<PedidoEdicao | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        setCarregando(true)
        setErro('')
        const response = await pedidoAPI.listar()
        setPedidos(response.data ?? [])
      } catch (error: any) {
        setErro(
          error?.response?.data?.erro ||
          error?.response?.data?.message ||
          'Não foi possível carregar seus pedidos.',
        )
      } finally {
        setCarregando(false)
      }
    }

    carregarPedidos()
  }, [])

  const resumoPedidos = useMemo(
    () => pedidos.reduce((acc, pedido) => acc + pedido.total, 0),
    [pedidos],
  )

  const formatarData = (dataPedido: string) => new Date(dataPedido).toLocaleString('pt-BR')

  const iniciarEdicao = (pedido: PedidoAPI) => {
    setPedidoEditando({
      idPedido: pedido.idPedido,
      endereco: pedido.endereco ?? '',
      observacoes: pedido.observacoes ?? '',
      itens: pedido.itens.map((item) => ({ ...item })),
    })
  }

  const atualizarQuantidadeItem = (produtoId: number, quantidade: number) => {
    if (!pedidoEditando) {
      return
    }

    const itensAtualizados = quantidade <= 0
      ? pedidoEditando.itens.filter((item) => item.produtoId !== produtoId)
      : pedidoEditando.itens.map((item) => (item.produtoId === produtoId ? { ...item, quantidade } : item))

    setPedidoEditando({
      ...pedidoEditando,
      itens: itensAtualizados,
    })
  }

  const salvarEdicao = async () => {
    if (!pedidoEditando) {
      return
    }

    if (!pedidoEditando.itens.length) {
      setErro('O pedido precisa ter ao menos um item.')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      const response = await pedidoAPI.atualizar(pedidoEditando.idPedido, {
        endereco: pedidoEditando.endereco,
        observacoes: pedidoEditando.observacoes,
        itens: pedidoEditando.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      })

      setPedidos((lista) =>
        lista.map((pedido) => (pedido.idPedido === pedidoEditando.idPedido ? response.data : pedido)),
      )
      setPedidoEditando(null)
    } catch (error: any) {
      setErro(
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Não foi possível atualizar o pedido.',
      )
    } finally {
      setSalvando(false)
    }
  }

  const cancelarPedido = async (pedidoId: number) => {
    const confirmado = window.confirm('Tem certeza que deseja cancelar este pedido?')
    if (!confirmado) {
      return
    }

    try {
      const response = await pedidoAPI.cancelar(pedidoId)
      setPedidos((lista) =>
        lista.map((pedido) => (pedido.idPedido === pedidoId ? response.data : pedido)),
      )

      if (pedidoEditando?.idPedido === pedidoId) {
        setPedidoEditando(null)
      }
    } catch (error: any) {
      setErro(
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Não foi possível cancelar o pedido.',
      )
    }
  }

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Meus pedidos</h1>
            <p className="mt-2 text-sm text-slate-500">Acompanhe, edite ou cancele pedidos pendentes</p>
          </div>
          <Link to="/produtos" className="inline-flex w-fit rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Fazer nova compra
          </Link>
        </div>

        {erro && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Pedidos</p>
            <strong className="text-2xl text-slate-900">{pedidos.length}</strong>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Pendentes</p>
            <strong className="text-2xl text-orange-600">
              {pedidos.filter((pedido) => pedido.status === 'PENDENTE').length}
            </strong>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total movimentado</p>
            <strong className="text-2xl text-blue-700">R$ {resumoPedidos.toFixed(2)}</strong>
          </div>
        </div>

        {carregando ? (
          <div className="rounded-[1.5rem] border border-slate-200 p-8 text-center text-slate-500">Carregando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">Você ainda não tem pedidos.</p>
            <Link to="/produtos" className="mt-4 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const editando = pedidoEditando?.idPedido === pedido.idPedido
              const statusClass = statusClasses[pedido.status] ?? 'bg-slate-100 text-slate-700'

              return (
                <article key={pedido.idPedido} className="rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Pedido</p>
                      <h2 className="text-xl font-black text-slate-900">#{pedido.idPedido}</h2>
                      <p className="text-sm text-slate-500">{formatarData(pedido.dataPedido)}</p>
                    </div>
                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClass}`}>
                      {pedido.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {pedido.itens.map((item) => (
                      <div key={`${pedido.idPedido}-${item.produtoId}`} className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-slate-700">{item.nomeProduto ?? `Produto ${item.produtoId}`}</span>
                        <span className="text-slate-600">
                          {item.quantidade}x • R$ {item.precoUnitario.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Endereço</p>
                      <p className="mt-1 text-sm text-slate-700">{pedido.endereco || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Observações</p>
                      <p className="mt-1 text-sm text-slate-700">{pedido.observacoes || 'Sem observações'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <strong className="text-lg text-blue-700">R$ {pedido.total.toFixed(2)}</strong>
                    {pedido.status === 'PENDENTE' && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => iniciarEdicao(pedido)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => cancelarPedido(pedido.idPedido)}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  {editando && pedidoEditando && (
                    <div className="mt-5 rounded-[1.25rem] border border-blue-200 bg-blue-50 p-4">
                      <h3 className="text-lg font-bold text-blue-900">Editar pedido #{pedidoEditando.idPedido}</h3>
                      <div className="mt-4 grid gap-4">
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          Endereço
                          <input
                            value={pedidoEditando.endereco}
                            onChange={(event) => setPedidoEditando({ ...pedidoEditando, endereco: event.target.value })}
                            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Informe o endereço de entrega"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          Observações
                          <textarea
                            value={pedidoEditando.observacoes}
                            onChange={(event) => setPedidoEditando({ ...pedidoEditando, observacoes: event.target.value })}
                            className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Ex.: deixar na portaria"
                          />
                        </label>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-700">Itens</p>
                          {pedidoEditando.itens.map((item) => (
                            <div key={item.produtoId} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                              <div>
                                <p className="font-semibold text-slate-900">{item.nomeProduto ?? `Produto ${item.produtoId}`}</p>
                                <p className="text-sm text-slate-500">R$ {item.precoUnitario.toFixed(2)} por unidade</p>
                              </div>
                              <input
                                type="number"
                                min={1}
                                value={item.quantidade}
                                onChange={(event) => atualizarQuantidadeItem(item.produtoId, Number(event.target.value))}
                                className="w-24 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                              <button
                                onClick={() => atualizarQuantidadeItem(item.produtoId, 0)}
                                className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={salvarEdicao}
                            disabled={salvando}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {salvando ? 'Salvando...' : 'Salvar alterações'}
                          </button>
                          <button
                            onClick={() => setPedidoEditando(null)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancelar edição
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </Layout>
  )
}
