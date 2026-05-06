import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { Button, Card } from '@/components/UI'
import { Mail, Lock, AlertCircle, ShieldCheck, Store } from 'lucide-react'
import { authAPI } from '@/lib/api-service'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      if (!email.trim()) {
        setErro('Email é obrigatório')
        return
      }
      if (!senha) {
        setErro('Senha é obrigatória')
        return
      }

      const response = await authAPI.login(email, senha)
      localStorage.setItem('token', response.data.token)
      const usuario = response.data.user ?? response.data
      localStorage.setItem('user', JSON.stringify(usuario))

      const { setUsuario } = useAuthStore.getState()
      setUsuario(usuario)
      window.location.replace('/home')

      navigate('/home')
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0,_#eff6ff_28%,_#f8fafc_58%,_#ffffff_100%)] px-4 py-10 flex items-center justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-orange-500 p-10 text-white sm:flex">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Store className="h-7 w-7" />
            </div>
            <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight">Entre no CampusShop e encontre tudo em um só lugar</h1>
            <p className="mt-4 max-w-md text-sm text-blue-50/90">
              Login rápido para comprar, vender, conversar e acompanhar seus pedidos sem sair da plataforma.
            </p>
          </div>

          <div className="space-y-3 text-sm text-blue-50/90">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Acesso rápido e protegido para sua conta</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <Store className="h-5 w-5" />
              <span>Compre, venda e acompanhe pedidos em um só lugar</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-none rounded-none bg-white">
          <div className="p-8 sm:p-10">
            <div className="sm:hidden mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
                <span className="text-3xl font-bold">📦</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">CampusShop</h1>
              <p className="mt-2 text-slate-600">Bem-vindo de volta!</p>
            </div>

            <div className="mb-8 hidden sm:block">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Entrar</h1>
              <p className="mt-2 text-sm text-slate-600">Use sua conta para continuar no marketplace.</p>
            </div>

            {erro && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <Button type="submit" loading={carregando} className="w-full rounded-2xl py-3.5 text-base shadow-lg shadow-blue-600/20">
                Entrar
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">ou</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/cadastro"
              className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Criar conta
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
