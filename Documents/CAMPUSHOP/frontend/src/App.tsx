import { useEffect } from 'react'
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

function App() {
  const { usuario, setUsuario } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    authAPI
      .me()
      .then((response) => {
        setUsuario(response.data)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setUsuario(null)
      })
  }, [setUsuario])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/categorias" element={<CategoriasPage />} />
      <Route path="/produto/:id" element={<ProdutoDetalhePage />} />
      <Route path="/produtos" element={<ProdutosPage />} />

      <Route path="/login" element={usuario ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/cadastro" element={usuario ? <Navigate to="/home" replace /> : <CadastroPage />} />

      <Route path="/carrinho" element={<CarrinhoPage />} />
      <Route path="/pedidos" element={<PedidosPage />} />
      <Route path="/conta" element={<ContaPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
