import { authAPI } from '@/lib/api-service'
import { addAuthListener, hasAuthToken } from '@/lib/auth-listener'
import { AjudaPage } from '@/pages/AjudaPage'
import { AnunciarPage } from '@/pages/AnunciarPage'
import { CadastrarProdutoPage } from '@/pages/CadastrarProdutoPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { CarrinhoPage } from '@/pages/CarrinhoPage'
import { CategoriasPage } from '@/pages/CategoriasPage'
import { ChatPage } from '@/pages/ChatPage'
import { ContaPage } from '@/pages/ContaPage'
import { EditarContaPage } from '@/pages/EditarContaPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { ManualUsuarioPage } from '@/pages/ManualUsuarioPage'
import { PedidosPage } from '@/pages/PedidosPage'
import { PrivacidadePage } from '@/pages/PrivacidadePage'
import { ProdutoDetalhePage } from '@/pages/ProdutoDetalhePage'
import { TermosPage } from '@/pages/TermosPage'
import { useAuthStore } from '@/store'
import { useEffect, useState } from 'react'
import { usuarioAPI } from '@/lib/api-service'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

const ROTAS_PROTEGIDAS = ['/carrinho', '/pedidos', '/conta', '/conta/editar', '/chat', '/cadastrar-produto']

function App() {
  const { usuario, setUsuario } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const location = useLocation()

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

  useEffect(() => {
    if (loading || !usuario) {
      return
    }

    // Solicita permissão de geolocalização na primeira vez que o usuário autenticado entra.
    try {
      const asked = localStorage.getItem('geo_asked')
      if (!asked && navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Envia localização ao backend autenticado; se falhar, apenas registra e segue.
            usuarioAPI
              .atualizarLocalizacao({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              })
              .catch(() => {
                // Não interrompe a aplicação se falhar.
                console.debug('Não foi possível enviar localização ao backend')
              })
          },
          (err) => {
            console.debug('Usuário negou ou erro ao obter localização:', err)
          }
        )
        localStorage.setItem('geo_asked', '1')
      }
    } catch (e) {
      console.debug('Geolocalização não disponível', e)
    }

    if (ROTAS_PROTEGIDAS.some((rota) => location.pathname === rota || location.pathname.startsWith(`${rota}/`))) {
      window.location.replace('/login')
    }
  }, [loading, location.pathname, usuario])

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
      <Route path="/ajuda" element={<AjudaPage />} />
      <Route path="/manual-usuario" element={<ManualUsuarioPage />} />
      <Route path="/privacidade" element={<PrivacidadePage />} />
      <Route path="/termos" element={<TermosPage />} />
      <Route path="/anunciar" element={<AnunciarPage />} />

      <Route path="/login" element={usuario ? <Navigate to="/produtos" replace /> : <LoginPage />} />
      <Route path="/cadastro" element={usuario ? <Navigate to="/produtos" replace /> : <CadastroPage />} />

      <Route path="/carrinho" element={usuario ? <CarrinhoPage /> : <Navigate to="/login" replace />} />
      <Route path="/pedidos" element={usuario ? <PedidosPage /> : <Navigate to="/login" replace />} />
      <Route path="/conta" element={usuario ? <ContaPage /> : <Navigate to="/login" replace />} />
      <Route path="/conta/editar" element={usuario ? <EditarContaPage /> : <Navigate to="/login" replace />} />
      <Route path="/chat" element={usuario ? <ChatPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App