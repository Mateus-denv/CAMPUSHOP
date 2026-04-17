# 🗺️ Frontend - Sistema de Roteamento (Routing)

## 📋 Visão Geral

O roteamento é feito com **React Router v6**, que permite navegação entre páginas sem recarregar.

**Localização:** `frontend/src/App.tsx` e `frontend/src/main.tsx`

---

## 🚀 Configuração Principal

### main.tsx - Ponto de Entrada

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

**O que faz:**

1. Envolve aplicação com `<BrowserRouter>`
2. Habilita roteamento client-side
3. Renderiza App principal

---

## 📍 Rotas Definidas

### App.tsx - Definição de Rotas

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { LoginPage } from '@/pages/LoginPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { HomePage } from '@/pages/HomePage'
import { ProdutosPage } from '@/pages/ProdutosPage'
import { ProdutoDetalhePage } from '@/pages/ProdutoDetalhePage'
import { CarrinhoPage } from '@/pages/CarrinhoPage'
import { CategoriasPage } from '@/pages/CategoriasPage'
import { PedidosPage } from '@/pages/PedidosPage'
import { ContaPage } from '@/pages/ContaPage'
import { ChatPage } from '@/pages/ChatPage'
import { CadastrarProdutoPage } from '@/pages/CadastrarProdutoPage'

export function App() {
  const usuario = useAuthStore().usuario

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/produtos" element={<ProdutosPage />} />
      <Route path="/produtos/:id" element={<ProdutoDetalhePage />} />
      <Route path="/categorias" element={<CategoriasPage />} />

      {/* Rotas Protegidas */}
      <Route
        path="/carrinho"
        element={
          usuario ? <CarrinhoPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/pedidos"
        element={
          usuario ? <PedidosPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/conta"
        element={
          usuario ? <ContaPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/chat"
        element={
          usuario ? <ChatPage /> : <Navigate to="/login" />
        }
      />

      {/* Rotas de Vendedor */}
      <Route
        path="/cadastrar-produto"
        element={
          usuario?.perfil === 'VENDEDOR' ? (
            <CadastrarProdutoPage />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Fallback - página não encontrada */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
```

---

## 📊 Tabela de Rotas

| Rota                 | Componente           | Autenticação   | Descrição                |
| -------------------- | -------------------- | -------------- | ------------------------ |
| `/`                  | HomePage             | Pública        | Página inicial           |
| `/login`             | LoginPage            | Pública        | Fazer login              |
| `/cadastro`          | CadastroPage         | Pública        | Registrar nova conta     |
| `/produtos`          | ProdutosPage         | Pública        | Listar todos os produtos |
| `/produtos/:id`      | ProdutoDetalhePage   | Pública        | Detalhes de um produto   |
| `/categorias`        | CategoriasPage       | Pública        | Listar categorias        |
| `/carrinho`          | CarrinhoPage         | ✅ Obrigatória | Carrinho de compras      |
| `/pedidos`           | PedidosPage          | ✅ Obrigatória | Meus pedidos             |
| `/conta`             | ContaPage            | ✅ Obrigatória | Configurações da conta   |
| `/chat`              | ChatPage             | ✅ Obrigatória | Chat com vendedor        |
| `/cadastrar-produto` | CadastrarProdutoPage | ✅ VENDEDOR    | Cadastrar novo produto   |

---

## 🔗 Navegação Entre Páginas

### Link Component

```typescript
import { Link } from 'react-router-dom'

export function MyComponent() {
  return (
    <div>
      {/* Link simples */}
      <Link to="/">Home</Link>

      {/* Link com parâmetro */}
      <Link to={`/produtos/${produtoId}`}>
        Ver Produto
      </Link>

      {/* Link com query params */}
      <Link to="/produtos?categoria=1&busca=notebook">
        Notebooks
      </Link>
    </div>
  )
}
```

### useNavigate Hook

```typescript
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = async (email, senha) => {
    // ... autenticação ...

    // Navega para home após login
    navigate('/home')

    // Navega para trás
    navigate(-1)

    // Navega com replace (não deixa no histórico)
    navigate('/', { replace: true })
  }

  return (
    // ...
  )
}
```

---

## 📝 Parâmetros de Rota

### Path Parameters `:id`

**Definição:**

```typescript
<Route path="/produtos/:id" element={<ProdutoDetalhePage />} />
```

**Acesso:**

```typescript
import { useParams } from 'react-router-dom'

export function ProdutoDetalhePage() {
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    // Carrega produto com ID
    carregarProduto(Number(id))
  }, [id])

  return <div>Produto {id}</div>
}
```

**URL:** `/produtos/123` → `id = "123"`

---

### Query Parameters `?key=value`

**Definição:** Não precisa definir na rota

**Acesso:**

```typescript
import { useSearchParams } from 'react-router-dom'

export function ProdutosPage() {
  const [searchParams] = useSearchParams()

  const categoria = searchParams.get('categoria')
  const busca = searchParams.get('busca')
  const pagina = searchParams.get('pagina') || '0'

  useEffect(() => {
    carregarProdutos(categoria, busca, pagina)
  }, [searchParams])

  return <div>Categoria: {categoria}</div>
}
```

**URL:** `/produtos?categoria=1&busca=notebook` → `categoria = "1"`, `busca = "notebook"`

---

## 🔓 Protected Route Pattern

### Solução 1: Inline (Simples)

```typescript
<Route
  path="/conta"
  element={
    usuario ? <ContaPage /> : <Navigate to="/login" />
  }
/>
```

### Solução 2: Componente Reutilizável

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

function ProtectedRoute({
  children,
  requiredRole
}: ProtectedRouteProps) {
  const usuario = useAuthStore().usuario

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && usuario.perfil !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Uso:
<Route
  path="/conta"
  element={
    <ProtectedRoute>
      <ContaPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/cadastrar-produto"
  element={
    <ProtectedRoute requiredRole="VENDEDOR">
      <CadastrarProdutoPage />
    </ProtectedRoute>
  }
/>
```

---

## 🔄 Redirecionar Após Ação

### Login

```typescript
async function handleLogin(email: string, senha: string) {
  const response = await authAPI.login(email, senha);

  // Salva token
  localStorage.setItem("token", response.data.token);

  // Atualiza store
  useAuthStore.setUsuario(response.data.user);

  // Redireciona para home
  navigate("/home");
}
```

### Logout

```typescript
function handleLogout() {
  localStorage.removeItem("token");
  useAuthStore.setUsuario(null);

  // Redireciona para login
  navigate("/login", { replace: true });
}
```

### Após Compra

```typescript
async function handleCheckout() {
  const response = await pedidoAPI.criar(carrinho);

  // Limpa carrinho
  useCarrinhoStore.setCarrinho({ itens: [] });

  // Redireciona para pedidos
  navigate(`/pedidos/${response.data.id}`);
}
```

---

## 🔍 useLocation Hook

Obter informações da rota atual:

```typescript
import { useLocation } from "react-router-dom";

export function MyComponent() {
  const location = useLocation();

  console.log(location.pathname); // "/produtos"
  console.log(location.search); // "?categoria=1"
  console.log(location.state); // Estado passado via navigate
}
```

**Passar estado entre rotas:**

```typescript
// De:
navigate("/pedidos", { state: { orderId: 123 } });

// Para:
const location = useLocation();
const orderId = location.state?.orderId;
```

---

## 🎯 Lazy Loading de Rotas

Para melhor performance com muitas páginas:

```typescript
import { lazy, Suspense } from 'react'

// Importa páginas sob demanda
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProdutosPage = lazy(() => import('@/pages/ProdutosPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Suspense>
  )
}
```

---

## 📱 Breadcrumbs (Trilha de Navegação)

```typescript
import { useLocation, Link } from 'react-router-dom'

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  return (
    <nav className="flex gap-2">
      <Link to="/">Home</Link>
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`

        return (
          <span key={index}>
            {' / '}
            <Link to={routeTo}>{pathname}</Link>
          </span>
        )
      })}
    </nav>
  )
}

// Exemplo:
// Em /produtos/123/detalhes
// Renderiza: Home / produtos / 123 / detalhes
```

---

## 🔗 Links Dinâmicos

### Geradores de URLs

```typescript
export const routes = {
  home: () => '/',
  login: () => '/login',
  cadastro: () => '/cadastro',
  produtos: () => '/produtos',
  produtoDetalhes: (id: number) => `/produtos/${id}`,
  categoria: (id: number) => `/produtos?categoria=${id}`,
  carrinho: () => '/carrinho',
  pedidos: (id?: number) => id ? `/pedidos/${id}` : '/pedidos',
  conta: () => '/conta',
  cadastrarProduto: () => '/cadastrar-produto'
}

// Uso:
<Link to={routes.produtoDetalhes(123)}>Ver Produto</Link>
navigate(routes.pedidos())
```

---

## 🎯 Próximos Passos

- Veja [01_PAGES.md](./01_PAGES.md) para ver páginas
- Veja [04_STORE.md](./04_STORE.md) para proteção de rotas
- Veja [02_COMPONENTS.md](./02_COMPONENTS.md) para componentes
