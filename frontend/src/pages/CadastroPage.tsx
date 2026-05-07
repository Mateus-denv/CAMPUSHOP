import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/UI'
import { authAPI } from '@/lib/api-service'
import { useAuthStore } from '@/store'
import { AlertCircle, CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react'
import { Logo } from '@/components/Logo'

export function CadastroPage() {
  const navigate = useNavigate()
  const { setUsuario } = useAuthStore()

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [ra, setRa] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [cidade, setCidade] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const cidades = ['Salvador', 'Camaçari']
  const universidades = {
    'Salvador': [
      // Públicas
      'Universidade Federal da Bahia (UFBA)',
      'Universidade do Estado da Bahia (UNEB)',
      'Universidade Estadual de Feira de Santana (UEFS)',
      'Instituto Federal da Bahia (IFBA)',
      // Particulares
      'Universidade Salvador (UNIFACS)',
      'Faculdade Baiana de Direito',
      'Faculdade Ruy Barbosa',
      'Escola Bahiana de Medicina e Saúde Pública',
      'Faculdade de Tecnologia e Ciências (FTC)',
      'Centro Universitário Jorge Amado (UNIJORGE)',
      'Faculdade de Ciências Humanas (FCH)',
      'Instituto de Ensino Superior da Bahia (IESB)',
      'Faculdade Metropolitana da Bahia (FAMEB)',
      'Centro Universitário Estácio da Bahia'
    ],
    'Camaçari': [
      // Públicas
      'Instituto Federal da Bahia - Campus Camaçari (IFBA)',
      // Particulares
      'Faculdade de Tecnologia e Ciências - Polo Camaçari (FTC)',
      'Centro Universitário Jorge Amado - Polo Camaçari (UNIJORGE)',
      'Faculdade Metropolitana da Bahia - Polo Camaçari (FAMEB)'
    ]
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      if (!nomeCompleto.trim()) {
        setErro('Nome completo é obrigatório')
        return
      }

      if (!/^\d{9}$/.test(ra.trim())) {
        setErro('R.A deve conter exatamente 9 dígitos')
        return
      }

      if (!email.trim()) {
        setErro('Email é obrigatório')
        return
      }

      if (!cpf.trim() || !/^\d{11}$/.test(cpf.trim())) {
        setErro('CPF deve conter 11 dígitos numéricos')
        return
      }

      if (!cidade) {
        setErro('Cidade é obrigatória')
        return
      }

      if (!instituicao) {
        setErro('Instituição é obrigatória')
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

      // Converter dataNascimento para formato ISO (YYYY-MM-DD) se necessário
      let dataFormatada = dataNascimento
      if (dataNascimento && typeof dataNascimento === 'string') {
        // Se estiver no formato DD/MM/YYYY, converter para YYYY-MM-DD
        if (dataNascimento.includes('/')) {
          const [dia, mes, ano] = dataNascimento.split('/')
          dataFormatada = `${ano}-${mes}-${dia}`
        }
      }

      const response = await authAPI.cadastro(
        nomeCompleto.trim(),
        email.trim(),
        ra.trim(),
        senha,
        confirmarSenha,
        instituicao.trim(),
        cidade.trim(),
        'usuario', // perfil padrão
        cpf.trim(),
        dataFormatada
      )

      localStorage.setItem('token', response.data.token)
      const userData = response.data.user || response.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUsuario(userData)
      navigate('/home')
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0,_#eff6ff_26%,_#f8fafc_58%,_#ffffff_100%)] px-4 py-8 flex items-center justify-center">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-700 via-blue-700 to-orange-500 p-10 text-white lg:flex">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <UserPlus className="h-7 w-7" />
            </div>
            <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight">Crie sua conta e negocie com segurança</h1>
            <p className="mt-4 max-w-md text-sm text-blue-50/90">
              Cadastre-se para anunciar, comprar, conversar em tempo real e acompanhar tudo no CampusShop.
            </p>
          </div>

          <div className="space-y-3 text-sm text-blue-50/90">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5" />
              <span>Cadastro rápido e simples para sua conta</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Seu acesso fica protegido com segurança</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-none rounded-none bg-white">
          <div className="p-8 sm:p-10">
            <div className="mb-6 flex justify-center sm:justify-start">
              <Logo className="h-14" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Criar conta</h1>
            <p className="text-sm text-slate-600 mb-6">Preencha os dados para entrar no CampusShop</p>

            {erro && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            <form onSubmit={handleCadastro} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 md:col-span-2"
                placeholder="Nome completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
              />
              <input
                className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                placeholder="R.A (9 dígitos)"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
              />
              <input
                type="email"
                className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <input
                type="password"
                className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              <input
                className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                placeholder="CPF (11 dígitos)"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
              <input
                type="date"
                className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                placeholder="Data de nascimento"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
              <div>
                <select
                  className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 w-full"
                  value={cidade}
                  onChange={(e) => {
                    setCidade(e.target.value)
                    setInstituicao('') // Reset instituição quando cidade muda
                  }}
                >
                  <option value="">Selecione uma cidade</option>
                  {cidades.map((cidadeOption) => (
                    <option key={cidadeOption} value={cidadeOption}>
                      {cidadeOption}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 w-full"
                  value={instituicao}
                  onChange={(e) => setInstituicao(e.target.value)}
                  disabled={!cidade}
                >
                  <option value="">Selecione uma instituição</option>
                  {cidade && universidades[cidade as keyof typeof universidades]?.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Button type="submit" loading={carregando} className="w-full rounded-2xl py-3.5 text-base shadow-lg shadow-blue-600/20">
                  Criar conta
                </Button>
              </div>
            </form>

            <p className="text-sm text-slate-600 mt-6 text-center">
              Já tem conta?{' '}
              <Link className="text-blue-600 font-semibold" to="/login">
                Entrar
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
