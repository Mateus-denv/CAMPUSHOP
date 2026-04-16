import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { authAPI } from '@/lib/api-service'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { CarrinhoPage } from '@/pages/CarrinhoPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { CategoriasPage } from '@/pages/CategoriasPage'
import { ProdutoDetalhePage } from '@/pages/ProdutoDetalhePage'
import { ContaPage } from '@/pages/ContaPage'
import { ChatPage } from '@/pages/ChatPage'
import { ProdutosPage } from '@/pages/ProdutosPage'
import { PedidosPage } from '@/pages/PedidosPage'
import { CadastrarProdutoPage } from '@/pages/CadastrarProdutoPage'

function App() {
  const { usuario, setUsuario } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    // Se não há token, usuário está deslogado
    if (!token) {
      setUsuario(null)
      setLoading(false)
      return
    }

    // Se há token e usuário salvo, restaura do localStorage
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUsuario(userData)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem('user')
      }
    }

    // Valida o token com o backend
    authAPI
      .me()
      .then((response) => {
        setUsuario(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUsuario(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [setUsuario])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/categorias" element={<CategoriasPage />} />
      <Route path="/produto/:id" element={<ProdutoDetalhePage />} />
      <Route path="/produtos" element={<ProdutosPage />} />
      <Route path="/cadastrar-produto" element={usuario ? <CadastrarProdutoPage /> : <Navigate to="/login" replace />} />

      <Route path="/login" element={usuario ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/cadastro" element={usuario ? <Navigate to="/home" replace /> : <CadastroPage />} />

      <Route path="/carrinho" element={usuario ? <CarrinhoPage /> : <Navigate to="/login" replace />} />
      <Route path="/pedidos" element={usuario ? <PedidosPage /> : <Navigate to="/login" replace />} />
      <Route path="/conta" element={usuario ? <ContaPage /> : <Navigate to="/login" replace />} />
      <Route path="/chat" element={usuario ? <ChatPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App