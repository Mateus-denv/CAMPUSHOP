import { pedidosAPI } from '@/lib/api-service'
import { clearAuth } from '@/lib/auth-listener'
import { countCartItems } from '@/lib/shop-storage'
import { useAuthStore } from '@/store'
import { Facebook, Instagram, LogOut, Mail, MessageCircle, PhoneCall, ShieldQuestion, User } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from './Logo'

type LayoutProps = {
  children: ReactNode
}

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/carrinho', label: 'Carrinho' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/chat', label: 'Chat' },
  { to: '/conta', label: 'Conta' },
]

export function Layout({ children }: LayoutProps) {
  const { usuario, setUsuario } = useAuthStore()
  const carrinhoCount = countCartItems()
  const [pedidosPendentes, setPedidosPendentes] = useState(0)

  useEffect(() => {
    const carregarPendentes = async () => {
      try {
        const response = await pedidosAPI.pendentesContagem()
        setPedidosPendentes(response.data?.total ?? 0)
      } catch {
        setPedidosPendentes(0)
      }
    }

    carregarPendentes()
    window.addEventListener('campushop-orders-changed', carregarPendentes)

    return () => window.removeEventListener('campushop-orders-changed', carregarPendentes)
  }, [usuario])

  const handleLogout = () => {
    setUsuario(null)
    clearAuth()
    // Redireciona para a home padrão ao sair, evitando retornos incorretos para páginas de produto
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#dbeafe_0,_#eff6ff_24%,_#f8fafc_58%,_#ffffff_100%)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/home" className="flex items-center gap-3 font-black tracking-tight text-slate-900">
            <Logo variant="home" />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
            {navItems.map((item) => (
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
                <span className="inline-flex items-center gap-2">
                  {item.label}
                  {item.to === '/carrinho' && carrinhoCount > 0 ? (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">{carrinhoCount}</span>
                  ) : null}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <div className="hidden items-center gap-3 rounded-full bg-slate-100 px-4 py-2 sm:flex">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">{usuario.nome}</span>
                  {pedidosPendentes > 0 ? (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
                      {pedidosPendentes} novos
                    </span>
                  ) : null}
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
          {navItems.map((item) => (
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
              <span className="inline-flex items-center gap-2">
                {item.label}
                {item.to === '/conta' && pedidosPendentes > 0 ? (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
                    {pedidosPendentes}
                  </span>
                ) : null}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-start gap-4">
                <Logo variant="completa" className="h-8 w-auto sm:h-10" />
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">CampuShop</p>
                  <p className="text-sm text-slate-500">Marketplace estudantil para compra, venda e troca no campus.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Contato</p>
                <div className="mt-3 space-y-2 text-sm">
                  <a href="mailto:suporte@campushop.com" className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
                    <Mail className="h-4 w-4" />
                    suporte@campushop.com
                  </a>
                  <a href="tel:+550000000000" className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
                    <PhoneCall className="h-4 w-4" />
                    (00) 0000-0000
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Redes sociais</p>
                <div className="mt-3 space-y-2 text-sm">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Suporte</p>
                <div className="mt-3 space-y-2 text-sm">
                  <a href="/ajuda" className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
                    <ShieldQuestion className="h-4 w-4" />
                    Central de ajuda
                  </a>
                  <a href="https://wa.me/550000000000" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Para vender</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Publique seus anúncios com fotos e preço.</p>
                  <p>Venda com segurança e combine retirada no campus.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CampuShop. Todos os direitos reservados.</p>
            <div className="flex flex-wrap gap-4">
              <a href="/privacidade" className="transition hover:text-slate-600">Privacidade</a>
              <a href="/termos" className="transition hover:text-slate-600">Termos</a>
              <a href="/anunciar" className="transition hover:text-slate-600">Anunciar</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
