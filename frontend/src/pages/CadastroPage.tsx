import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/UI'
import { authAPI } from '@/lib/api-service'
import { useAuthStore } from '@/store'
import { AlertCircle, UserPlus, ShieldCheck } from 'lucide-react'

export function CadastroPage() {
  const navigate = useNavigate()
  const { setUsuario } = useAuthStore()

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [ra, setRa] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [instituicao, setInstituicao] = useState('SENAI')
  const [cidade, setCidade] = useState('São Paulo')
  const [perfil, setPerfil] = useState('comprador')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const nome = nomeCompleto.trim()
      const emailNormalizado = email.trim().toLowerCase()
      const raLimpo = ra.replace(/\D/g, '')

      if (!nome || !emailNormalizado || !raLimpo || !senha || !confirmarSenha) {
        setErro('Preencha todos os campos obrigatórios')
        return
      }

      if (!/^\d{9}$/.test(raLimpo)) {
        setErro('R.A deve conter exatamente 9 dígitos numéricos')
        return
      }

      if (senha.length < 6) {
        setErro('A senha deve ter pelo menos 6 caracteres')
        return
      }

      if (senha !== confirmarSenha) {
        setErro('As senhas não coincidem')
        return
      }

      const response = await authAPI.cadastro(
        nome,
        emailNormalizado,
        raLimpo,
        senha,
        confirmarSenha,
        instituicao,
        cidade,
        perfil
      )

      localStorage.setItem('token', response.data.token)
      setUsuario(response.data.user)
      navigate('/home')
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0,_#eff6ff_28%,_#f8fafc_58%,_#ffffff_100%)] px-4 py-8 flex items-center justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-orange-500 p-10 text-white lg:flex">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <UserPlus className="h-7 w-7" />
            </div>
            <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight">Crie sua conta e comece a vender ou comprar no CampusShop</h1>
            <p className="mt-4 text-sm text-blue-50/90">
              Cadastro rápido, seguro e integrado ao mesmo ambiente da plataforma.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-blue-50/90">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4" /> Conta protegida
            </div>
            <p className="mt-2">Seu acesso usa autenticação com token e senha criptografada.</p>
          </div>
        </div>

        <Card className="border-0 shadow-none rounded-none bg-white">
          <div className="p-8 sm:p-10">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Criar conta</h1>
            <p className="text-slate-600 mb-6">Preencha os dados para entrar no CampusShop</p>

            {erro && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            <form onSubmit={handleCadastro} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none md:col-span-2"
                placeholder="Nome completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
              />
              <input
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                placeholder="R.A (9 dígitos)"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                maxLength={9}
              />
              <input
                type="email"
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <input
                type="password"
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              <input
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                placeholder="Instituição"
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
              />
              <input
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
              <select
                className="px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
              >
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
                <option value="ambos">Ambos</option>
              </select>

              <div className="md:col-span-2">
                <Button type="submit" loading={carregando} className="w-full rounded-2xl py-3.5 text-base shadow-lg shadow-blue-600/20">
                  Criar conta
                </Button>
              </div>
            </form>

            <p className="text-sm text-slate-600 mt-6 text-center">
              Já tem conta?{' '}
              <Link className="text-blue-700 font-semibold hover:text-blue-800" to="/login">
                Entrar
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
