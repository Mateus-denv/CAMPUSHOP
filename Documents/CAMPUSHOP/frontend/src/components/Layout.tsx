import { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { LogOut, User } from 'lucide-react'

type LayoutProps = {
  children: ReactNode
}

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/carrinho', label: 'Carrinho' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/chat', label: 'Chat' },
  { to: '/conta', label: 'Conta' },
]

const privateNavPaths = new Set(['/carrinho', '/pedidos', '/chat', '/conta'])

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { usuario, setUsuario } = useAuthStore()
  const navItemsVisiveis = navItems.filter((item) => usuario || !privateNavPaths.has(item.to))

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUsuario(null)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0,_#eff6ff_24%,_#f8fafc_58%,_#ffffff_100%)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/home" className="flex items-center gap-3 font-black tracking-tight text-slate-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xl text-white shadow-lg shadow-blue-600/20">📦</span>
            <span className="text-lg sm:text-xl">CampusShop</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
            {navItemsVisiveis.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <div className="hidden items-center gap-3 rounded-full bg-slate-100 px-4 py-2 sm:flex">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">{usuario.nome}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex">
                  Entrar
                </Link>
                <Link to="/cadastro" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur md:hidden">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {navItemsVisiveis.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  )
}
