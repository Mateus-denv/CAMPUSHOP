import { ReactNode, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { clearAuth } from '@/lib/auth-listener'
import { LogOut, Menu, Search, ShoppingCart, User, X } from 'lucide-react'
import { countCartItems } from '@/lib/shop-storage'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { usuario, setUsuario } = useAuthStore()
  const [menuAberto, setMenuAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const qtdCarrinho = countCartItems()

  const handleLogout = () => {
    setUsuario(null)
    clearAuth()
    navigate('/login', { replace: true })
  }

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault()
    if (busca.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(busca.trim())}`)
      setBusca('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top bar */}
      <div className="bg-blue-700 py-1.5 text-center text-xs font-medium text-blue-100">
        Marketplace exclusivo para estudantes universitários 🎓
      </div>

      {/* Header principal */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/home" className="flex shrink-0 items-center gap-2 font-black text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">CS</span>
            <span className="hidden text-lg sm:block">CampuShop</span>
          </Link>

          {/* Busca central */}
          <form onSubmit={handleBusca} className="flex flex-1 items-center overflow-hidden rounded-full border border-gray-300 bg-gray-50 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Busque produtos, livros, eletrônicos..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="flex h-full items-center gap-1 rounded-r-full bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Ações */}
          <div className="flex shrink-0 items-center gap-2">
            {usuario ? (
              <>
                <Link to="/carrinho" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-slate-600 transition hover:bg-gray-50">
                  <ShoppingCart className="h-4 w-4" />
                  {qtdCarrinho > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {qtdCarrinho > 9 ? '9+' : qtdCarrinho}
                    </span>
                  )}
                </Link>
                <Link to="/conta" className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-gray-50">
                  <User className="h-4 w-4" />
                  <span className="hidden max-w-[100px] truncate sm:block">
                    {(usuario.nomeCompleto ?? usuario.nome ?? '').split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sair"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50">
                  Entrar
                </Link>
                <Link to="/cadastro" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Cadastrar
                </Link>
              </>
            )}
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 md:hidden" onClick={() => setMenuAberto(!menuAberto)}>
              {menuAberto ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Navegação secundária */}
        <div className="hidden border-t border-gray-100 bg-white md:block">
          <nav className="mx-auto flex max-w-7xl items-center gap-0 px-4 sm:px-6 lg:px-8">
            {[
              { to: '/home', label: 'Início' },
              { to: '/categorias', label: 'Categorias' },
              { to: '/produtos', label: 'Produtos' },
              ...(usuario ? [
                { to: '/pedidos', label: 'Meus pedidos' },
                { to: '/chat', label: 'Mensagens' },
              ] : []),
              ...(usuario?.vendedorAtivo ? [
                { to: '/cadastrar-produto', label: '+ Anunciar' },
              ] : []),
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `border-b-2 px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:border-gray-300 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Menu mobile */}
        {menuAberto && (
          <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {[
                { to: '/home', label: 'Início' },
                { to: '/categorias', label: 'Categorias' },
                { to: '/produtos', label: 'Produtos' },
                ...(usuario ? [
                  { to: '/carrinho', label: 'Carrinho' },
                  { to: '/pedidos', label: 'Meus pedidos' },
                  { to: '/chat', label: 'Mensagens' },
                  { to: '/conta', label: 'Minha conta' },
                ] : []),
                ...(usuario?.vendedorAtivo ? [
                  { to: '/cadastrar-produto', label: '+ Anunciar produto' },
                ] : []),
              ].map((item) => (
                <NavLink
                  key={`m-${item.to}`}
                  to={item.to}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-2.5 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-gray-50'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 font-black text-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">CS</span>
              CampuShop
            </div>
            <p className="text-sm text-slate-500">© 2026 CampuShop — Marketplace Estudantil</p>
            <div className="flex gap-4 text-sm text-slate-500">
              <span>Sobre</span>
              <span>Contato</span>
              <span>Termos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

