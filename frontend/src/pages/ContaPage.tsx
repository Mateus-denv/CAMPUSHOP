import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { useAuthStore } from '@/store'
import { getFavoriteProducts, getOrders } from '@/lib/shop-storage'
import { produtoAPI, usuarioAPI } from '@/lib/api-service'
import { useNavigate } from 'react-router-dom'

type UsuarioProduto = {
  idProduto: number
  nomeProduto: string
  descricao: string
  estoque: number
  preco?: number
  categoria?: {
    idCategoria: number
    nome_categoria: string
  }
}

type FavoritoProduto = {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  categoria?: string
}

const tabs = ['Visão Geral', 'Meus Produtos', 'Compras', 'Favoritos', 'Editar Perfil', 'Configurações']

export function ContaPage() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('Visão Geral')
  const [produtos, setProdutos] = useState<UsuarioProduto[]>([])
  const [favoritos, setFavoritos] = useState<FavoritoProduto[]>([])
  const { usuario, setUsuario } = useAuthStore()
  const [nomePerfil, setNomePerfil] = useState('')
  const [emailPerfil, setEmailPerfil] = useState('')
  const [raPerfil, setRaPerfil] = useState('')
  const [erroPerfil, setErroPerfil] = useState('')
  const [mensagemPerfil, setMensagemPerfil] = useState('')
  const [mensagemConfig, setMensagemConfig] = useState('')
  const [erroConfig, setErroConfig] = useState('')
  const [excluindoConta, setExcluindoConta] = useState(false)
  const pedidos = getOrders()

  useEffect(() => {
    if (aba === 'Meus Produtos') {
      carregarMeusProdutos()
    }

    if (aba === 'Favoritos') {
      setFavoritos(getFavoriteProducts())
    }
  }, [aba])

  useEffect(() => {
    setNomePerfil(usuario?.nomeCompleto || usuario?.nome || '')
    setEmailPerfil(usuario?.email || '')
    setRaPerfil(usuario?.ra || '')
  }, [usuario])

  const carregarMeusProdutos = async () => {
    try {
      const response = await produtoAPI.listarMeus()
      setProdutos(response.data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const salvarPerfil = (event: React.FormEvent) => {
    event.preventDefault()
    setErroPerfil('')
    setMensagemPerfil('')

    if (!nomePerfil.trim()) {
      setErroPerfil('Nome é obrigatório')
      return
    }

    if (!emailPerfil.trim() || !emailPerfil.includes('@')) {
      setErroPerfil('Informe um email válido')
      return
    }

    const usuarioAtualizado = {
      ...(usuario ?? {}),
      nome: nomePerfil.trim(),
      nomeCompleto: nomePerfil.trim(),
      email: emailPerfil.trim().toLowerCase(),
      ra: usuario?.ra ?? raPerfil,
    }

    setUsuario(usuarioAtualizado)
    localStorage.setItem('user', JSON.stringify(usuarioAtualizado))
    setMensagemPerfil('Perfil atualizado com sucesso!')
  }

  const excluirConta = async () => {
    setErroConfig('')
    setMensagemConfig('')

    const confirmado = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')
    if (!confirmado) {
      return
    }

    try {
      setExcluindoConta(true)
      const userId = Number((usuario as any)?.id)

      if (!userId || Number.isNaN(userId)) {
        throw new Error('Não foi possível identificar o usuário logado para exclusão.')
      }

      await usuarioAPI.excluir(userId)

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUsuario(null)
      navigate('/login', { replace: true })
    } catch (error: any) {
      setErroConfig(error?.response?.data?.message || error?.message || 'Erro ao excluir conta')
    } finally {
      setExcluindoConta(false)
    }
  }

  const nome = usuario?.nomeCompleto || usuario?.nome || 'Minha conta'
  const email = usuario?.email || 'Email não informado'
  const ra = usuario?.ra ? `R.A ${usuario.ra}` : 'R.A não informado'
  const compras = pedidos.length

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <aside className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-100" />
            <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">{nome}</h2>
            <p className="mt-2 text-center text-sm text-slate-500">{email}</p>
            <p className="text-center text-sm text-slate-500">{ra}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-3xl font-black text-blue-700">8</p><p className="text-sm text-slate-500">Vendas</p></div>
              <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-3xl font-black text-orange-500">{compras}</p><p className="text-sm text-slate-500">Compras</p></div>
            </div>
            <a href="/cadastrar-produto" className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-center font-semibold text-white shadow-lg shadow-blue-600/20">+ Anunciar produto</a>
            <button onClick={() => setAba('Editar Perfil')} className="mt-3 w-full rounded-2xl border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Editar perfil</button>
            <button onClick={() => setAba('Configurações')} className="mt-3 w-full rounded-2xl border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Configurações da conta</button>
          </aside>

          <main className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 text-sm font-semibold">
              {tabs.map((item) => (
                <button key={item} onClick={() => setAba(item)} className={`rounded-2xl px-4 py-2.5 transition ${aba === item ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>
                  {item}
                </button>
              ))}
            </div>

            {aba === 'Visão Geral' ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Produtos ativos</p><p className="mt-1 text-3xl font-black text-blue-700">1</p></div>
                  <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Produtos vendidos</p><p className="mt-1 text-3xl font-black text-orange-500">8</p></div>
                  <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm text-slate-500">Pedidos</p><p className="mt-1 text-3xl font-black text-emerald-600">{compras}</p></div>
                </div>
                <div className="mt-4 min-h-[260px] rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Atividade recente</h3>
                  <div className="mt-4 space-y-4 text-sm text-slate-700 sm:text-base">
                    <p>🟢 Seus produtos mais vistos aparecem aqui</p>
                    <p>🟠 Você possui {compras} pedidos registrados</p>
                    <p>🔵 Vendas recentes são atualizadas automaticamente</p>
                    <div className="pt-2">
                      <Link to="/pedidos" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                        Ver meus pedidos
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : aba === 'Meus Produtos' ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Meus produtos</h3>
                <p className="mt-1 text-slate-500">Gerencie os produtos que você anunciou.</p>
                {produtos.length === 0 ? (
                  <div className="mt-4 text-center">
                    <p className="text-slate-500">Você ainda não anunciou nenhum produto.</p>
                    <Link to="/cadastrar-produto" className="mt-4 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white">
                      Anunciar primeiro produto
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {produtos.map((produto) => (
                      <div key={produto.idProduto} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <h4 className="font-bold text-slate-900">{produto.nomeProduto}</h4>
                        <p className="text-sm text-slate-600">{produto.descricao}</p>
                        <p className="mt-2 font-semibold text-blue-600">R$ {produto.preco?.toFixed(2)}</p>
                        <p className="text-sm text-slate-500">Estoque: {produto.estoque}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : aba === 'Compras' ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Minhas compras</h3>
                <p className="mt-1 text-slate-500">Acompanhe os pedidos que você realizou.</p>
                {pedidos.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-500">
                    Você ainda não possui pedidos registrados.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {pedidos.map((pedido) => (
                      <div key={pedido.id} className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-semibold text-slate-900">Pedido {pedido.id}</p>
                        <p className="text-sm text-slate-500">{pedido.itens.length} itens</p>
                        <p className="mt-1 font-bold text-blue-700">R$ {pedido.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : aba === 'Favoritos' ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Favoritos</h3>
                <p className="mt-1 text-slate-500">Produtos que você marcou para ver depois.</p>

                {favoritos.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <p className="text-slate-500">Você ainda não favoritou nenhum produto.</p>
                    <Link to="/produtos" className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                      Explorar produtos
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favoritos.map((produto) => (
                      <div key={produto.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <h4 className="font-bold text-slate-900">{produto.nome}</h4>
                        <p className="line-clamp-2 text-sm text-slate-600">{produto.descricao}</p>
                        <p className="mt-2 font-semibold text-blue-600">R$ {produto.preco.toFixed(2)}</p>
                        <p className="text-sm text-slate-500">Estoque: {produto.estoque}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : aba === 'Editar Perfil' ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Editar perfil</h3>
                <p className="mt-1 text-slate-500">Atualize suas informações principais da conta.</p>

                {erroPerfil && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {erroPerfil}
                  </div>
                )}

                {mensagemPerfil && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {mensagemPerfil}
                  </div>
                )}

                <form onSubmit={salvarPerfil} className="mt-4 grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nome completo</label>
                    <input
                      value={nomePerfil}
                      onChange={(event) => setNomePerfil(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={emailPerfil}
                      onChange={(event) => setEmailPerfil(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">R.A</label>
                    <input
                      value={raPerfil}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                      placeholder="R.A"
                    />
                    <p className="mt-1 text-xs text-slate-500">R.A é único e não pode ser alterado.</p>
                  </div>

                  <button type="submit" className="mt-2 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white">
                    Salvar alterações
                  </button>
                </form>
              </div>
            ) : aba === 'Configurações' ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Configurações da conta</h3>
                <p className="mt-1 text-slate-500">Atualize seu código de entrega para confirmar pedidos com segurança.</p>

                {erroConfig && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {erroConfig}
                  </div>
                )}

                {mensagemConfig && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {mensagemConfig}
                  </div>
                )}

                <div className="mt-4 rounded-2xl bg-blue-50 p-6 text-center">
                  <p className="text-sm text-slate-600">Seu código atual</p>
                  <p className="mt-2 text-4xl font-black tracking-[0.3em] text-blue-700">_ _ _ _</p>
                </div>
                <input className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Novo código de entrega" />
                <button className="mt-3 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white">Atualizar código</button>

                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">Zona de perigo</p>
                  <p className="mt-1 text-sm text-red-600">Excluir sua conta remove seu acesso e desativa seu cadastro.</p>
                  <button
                    type="button"
                    onClick={excluirConta}
                    disabled={excluindoConta}
                    className="mt-3 w-full rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {excluindoConta ? 'Excluindo conta...' : 'Excluir conta'}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
                  <p className="mb-2 font-semibold text-slate-900">Importante:</p>
                  <ul className="list-inside list-disc text-slate-600">
                    <li>Pode ser solicitado por quem vai fazer a entrega</li>
                    <li>Não deve ser compartilhado no chat</li>
                    <li>Não pode ser igual aos 4 últimos dígitos do telefone</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm text-slate-500">Selecione uma aba.</div>
            )}
          </main>
        </div>
      </section>
    </Layout>
  )
}
