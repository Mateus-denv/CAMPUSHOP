import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={usuario ? <Navigate to="/home" replace /> : <LoginPage />}
        />
        <Route
          path="/cadastro"
          element={usuario ? <Navigate to="/home" replace /> : <CadastroPage />}
        />
        <Route path="/home" element={<HomePage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/produto/:id" element={<ProdutoDetalhePage />} />
        <Route path="/produtos" element={<Navigate to="/home" replace />} />
        <Route
          path="/carrinho"
          element={usuario ? <CarrinhoPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/conta"
          element={usuario ? <ContaPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat"
          element={usuario ? <ChatPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
