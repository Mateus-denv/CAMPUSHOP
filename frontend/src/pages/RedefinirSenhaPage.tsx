import { Button, Card } from '@/components/UI'
import { authAPI } from '@/lib/api-service'
import { AlertCircle, CheckCircle2, Lock, ShieldCheck, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export function RedefinirSenhaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErro('')
    setSucesso('')

    if (!token) {
      setErro('Token inválido ou ausente')
      return
    }

    if (novaSenha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    setCarregando(true)

    try {
      await authAPI.redefinirSenha(token, novaSenha)
      setSucesso('Senha redefinida com sucesso')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Não foi possível redefinir a senha')
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
            <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight">Defina uma nova senha</h1>
            <p className="mt-4 max-w-md text-sm text-blue-50/90">
              Crie uma nova senha segura para acessar sua conta novamente.
            </p>
          </div>

          <div className="space-y-3 text-sm text-blue-50/90">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Proteção da sua conta</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-none rounded-none bg-white">
          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Redefinir senha</h1>
              <p className="mt-2 text-sm text-slate-600">Escolha uma nova senha para continuar.</p>
            </div>

            {erro && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            {sucesso && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <p className="text-sm text-green-800">{sucesso}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(event) => setConfirmarSenha(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <Button type="submit" loading={carregando} className="w-full rounded-2xl py-3.5 text-base shadow-lg shadow-blue-600/20">
                Salvar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                Voltar para o login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
