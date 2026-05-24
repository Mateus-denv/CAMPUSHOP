import { authAPI } from '@/lib/api-service'
import { addAuthListener, hasAuthToken } from '@/lib/auth-listener'
import { CadastrarProdutoPage } from '@/pages/CadastrarProdutoPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { CarrinhoPage } from '@/pages/CarrinhoPage'
import { CategoriasPage } from '@/pages/CategoriasPage'
import { ChatPage } from '@/pages/ChatPage'
import { ContaPage } from '@/pages/ContaPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { PedidosPage } from '@/pages/PedidosPage'
import { ProdutoDetalhePage } from '@/pages/ProdutoDetalhePage'
import { useAuthStore } from '@/store'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  const { usuario, setUsuario } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verificarAutenticacao = () => {
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
    }

    // Executa na primeira carga
    verificarAutenticacao()

    // Listener para mudanças de autenticação (logout em qualquer aba)
    const unsubscribe = addAuthListener(() => {
      if (!hasAuthToken()) {
        setUsuario(null)
      } else {
        verificarAutenticacao()
      }
    })

    return () => unsubscribe()
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
      <Route path="/categorias" element={<Navigate to="/produtos" replace />} />
      <Route path="/produtos" element={<CategoriasPage />} />
      <Route path="/produto/:id" element={<ProdutoDetalhePage />} />
      <Route path="/cadastrar-produto" element={usuario ? <CadastrarProdutoPage /> : <Navigate to="/login" replace />} />

      <Route path="/login" element={usuario ? <Navigate to="/produtos" replace /> : <LoginPage />} />
      <Route path="/cadastro" element={usuario ? <Navigate to="/produtos" replace /> : <CadastroPage />} />

      <Route path="/carrinho" element={usuario ? <CarrinhoPage /> : <Navigate to="/login" replace />} />
      <Route path="/pedidos" element={usuario ? <PedidosPage /> : <Navigate to="/login" replace />} />
      <Route path="/conta" element={usuario ? <ContaPage /> : <Navigate to="/login" replace />} />
      <Route path="/chat" element={usuario ? <ChatPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App