import { Layout } from '@/components/Layout'
import { chatAPI, type ChatMensagemAPI, type ChatPedidoAPI } from '@/lib/api-service'
import { useEffect, useMemo, useState } from 'react'

export function ChatPage() {
  const [pedidos, setPedidos] = useState<ChatPedidoAPI[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<ChatPedidoAPI | null>(null)
  const [mensagens, setMensagens] = useState<ChatMensagemAPI[]>([])
  const [texto, setTexto] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregarPedidos = async () => {
      setCarregando(true)
      try {
        const response = await chatAPI.listarPedidos()
        setPedidos(response.data)
      } catch (err) {
        setErro('Não foi possível carregar as conversas. Tente novamente.')
      } finally {
        setCarregando(false)
      }
    }

    carregarPedidos()
  }, [])

  useEffect(() => {
    if (!pedidoSelecionado) {
      setMensagens([])
      return
    }

    const carregarMensagens = async () => {
      setCarregando(true)
      try {
        const response = await chatAPI.listarMensagens(pedidoSelecionado.pedidoId)
        setMensagens(response.data)
      } catch (err) {
        setErro('Não foi possível carregar as mensagens deste pedido.')
      } finally {
        setCarregando(false)
      }
    }

    carregarMensagens()
  }, [pedidoSelecionado])

  const pedidosOrdenados = useMemo(
    () => [...pedidos].sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? '')),
    [pedidos]
  )

  const enviarMensagem = async () => {
    if (!pedidoSelecionado || !texto.trim()) {
      return
    }

    try {
      const response = await chatAPI.enviarMensagem(pedidoSelecionado.pedidoId, texto.trim())
      setMensagens((current) => [...current, response.data])
      setTexto('')
    } catch (err) {
      setErro('Não foi possível enviar a mensagem. Tente novamente.')
    }
  }

  return (
    <Layout>
      <section className="grid min-h-[calc(100vh-6rem)] gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Conversas</h2>
              <p className="mt-1 text-sm text-slate-500">Cliente x vendedor</p>
            </div>
          </div>

          {carregando && pedidos.length === 0 ? (
            <div className="mt-6 text-sm text-slate-500">Carregando conversas...</div>
          ) : pedidosOrdenados.length === 0 ? (
            <div className="mt-6 text-sm text-slate-500">Nenhuma conversa encontrada ainda.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {pedidosOrdenados.map((pedido) => (
                <button
                  type="button"
                  key={pedido.pedidoId}
                  onClick={() => setPedidoSelecionado(pedido)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    pedidoSelecionado?.pedidoId === pedido.pedidoId
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{pedido.parceiroNome}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {pedido.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{pedido.produtoNome}</p>
                  <p className="mt-3 text-xs text-slate-400">{pedido.souVendedor ? 'Você é vendedor' : 'Você é comprador'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {!pedidoSelecionado ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center text-slate-500">
              <span className="text-5xl">💬</span>
              <h1 className="text-2xl font-black text-slate-900">Escolha uma conversa</h1>
              <p className="max-w-xl text-sm leading-6">
                Aqui você poderá trocar mensagens com o vendedor ou comprador associado a um pedido.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pedido #{pedidoSelecionado.pedidoId}</p>
                  <h1 className="text-3xl font-black text-slate-900">{pedidoSelecionado.parceiroNome}</h1>
                  <p className="text-sm text-slate-500">{pedidoSelecionado.produtoNome}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  {pedidoSelecionado.status}
                </span>
              </div>

              <div className="flex min-h-[420px] flex-col gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
                {carregando && mensagens.length === 0 ? (
                  <p className="text-sm text-slate-500">Carregando mensagens...</p>
                ) : mensagens.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhuma mensagem neste pedido. Envie a primeira mensagem.</p>
                ) : (
                  <div className="space-y-4">
                    {mensagens.map((mensagem) => (
                      <div key={mensagem.id} className="rounded-3xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold text-slate-900">{mensagem.usuarioNome}</span>
                          <span className="text-xs text-slate-400">{mensagem.criadoEm?.replace('T', ' ')}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-700">{mensagem.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <textarea
                  value={texto}
                  onChange={(event) => setTexto(event.target.value)}
                  rows={3}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[110px] w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={enviarMensagem}
                  className="inline-flex h-14 items-center justify-center rounded-[1.5rem] bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!texto.trim()}
                >
                  Enviar
                </button>
              </div>
            </>
          )}

          {erro && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
        </div>
      </section>
    </Layout>
  )
}
