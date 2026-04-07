import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { ShoppingCart, LogOut, Home, GraduationCap, User, Search, Package, Menu, Heart } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 text-white text-xs sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <p className="font-medium tracking-wide">CampusShop • tudo no mesmo localhost</p>
          <div className="hidden items-center gap-4 sm:flex">
            <span>Entrega combinada com vendedores locais</span>
            <span className="opacity-70">|</span>
            <span>Pagamento e chat integrados</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
        <Link to="/home" className="flex min-w-fit items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20">
            <Package className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              <span className="text-blue-700">Campu</span>
              <span className="text-orange-500">Shop</span>
            </span>
            <span className="block text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
              marketplace estudantil
            </span>
          </div>
        </Link>

        <div className="hidden flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Buscar livros, roupas, eletrônicos e serviços"
            className="ml-3 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-2 text-sm font-semibold text-slate-600 lg:flex">
          <Link to="/home" className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${isActive('/home') ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <Home className="h-4 w-4" /> Início
          </Link>
          <Link to="/categorias" className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${isActive('/categorias') ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <GraduationCap className="h-4 w-4" /> Categorias
          </Link>
          {usuario ? (
            <Link to="/conta" className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${isActive('/conta') ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
              <User className="h-4 w-4" /> Minha conta
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900">
                Entrar
              </Link>
              <Link to="/cadastro" className="rounded-full bg-slate-900 px-4 py-2 text-white shadow-sm transition-transform hover:scale-[1.02]">
                Cadastrar
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            to="/favoritos"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 md:flex"
            aria-label="Favoritos"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <Link
            to="/carrinho"
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${isActive('/carrinho') ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>
          {usuario && (
            <button onClick={handleLogout} className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 md:flex" title="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          )}
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden" aria-label="Menu">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return null
}
