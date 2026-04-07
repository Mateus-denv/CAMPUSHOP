import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/UI'
import { authAPI } from '@/lib/api-service'
import { useAuthStore } from '@/store'
import { AlertCircle } from 'lucide-react'

export function CadastroPage() {
  const navigate = useNavigate()
  const { setUsuario } = useAuthStore()

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [ra, setRa] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
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
      const response = await authAPI.cadastro(
        nomeCompleto,
        email,
        ra,
        senha,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h1>
          <p className="text-gray-600 mb-6">Preencha os dados para entrar no CampusShop</p>

          {erro && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{erro}</p>
            </div>
          )}

          <form onSubmit={handleCadastro} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none md:col-span-2"
              placeholder="Nome completo"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
            <input
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="R.A (9 dígitos)"
              value={ra}
              onChange={(e) => setRa(e.target.value)}
            />
            <input
              type="email"
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <input
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Instituição"
              value={instituicao}
              onChange={(e) => setInstituicao(e.target.value)}
            />
            <input
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            <select
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
            >
              <option value="comprador">Comprador</option>
              <option value="vendedor">Vendedor</option>
              <option value="ambos">Ambos</option>
            </select>

            <div className="md:col-span-2">
              <Button type="submit" loading={carregando} className="w-full">
                Criar conta
              </Button>
            </div>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Já tem conta?{' '}
            <Link className="text-blue-600 font-semibold" to="/login">
              Entrar
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
