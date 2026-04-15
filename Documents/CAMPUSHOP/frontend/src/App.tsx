import { useEffect, useMemo, useState } from 'react'
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
  const [authCarregando, setAuthCarregando] = useState(true)
  const token = useMemo(() => localStorage.getItem('token'), [])

  const exigirLogin = (element: JSX.Element) => {
    if (usuario) {
      return element
    }

    if (token && authCarregando) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
          Validando sessão...
        </div>
      )
    }

    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    if (!token) {
      setAuthCarregando(false)
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
      .finally(() => {
        setAuthCarregando(false)
      })
  }, [setUsuario])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/categorias" element={<CategoriasPage />} />
      <Route path="/produto/:id" element={<ProdutoDetalhePage />} />
      <Route path="/produtos" element={<ProdutosPage />} />

      <Route
        path="/login"
        element={token && authCarregando ? <div className="min-h-[50vh] flex items-center justify-center text-slate-500">Validando sessão...</div> : usuario ? <Navigate to="/home" replace /> : <LoginPage />}
      />
      <Route
        path="/cadastro"
        element={token && authCarregando ? <div className="min-h-[50vh] flex items-center justify-center text-slate-500">Validando sessão...</div> : usuario ? <Navigate to="/home" replace /> : <CadastroPage />}
      />

      <Route path="/carrinho" element={exigirLogin(<CarrinhoPage />)} />
      <Route path="/pedidos" element={exigirLogin(<PedidosPage />)} />
      <Route path="/conta" element={exigirLogin(<ContaPage />)} />
      <Route path="/chat" element={exigirLogin(<ChatPage />)} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
