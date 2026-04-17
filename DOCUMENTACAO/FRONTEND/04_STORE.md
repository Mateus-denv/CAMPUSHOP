# 🏪 Frontend - Gerenciamento de Estado (Store)

## 📋 Visão Geral

O gerenciamento de estado global é feito com **Zustand**, uma biblioteca leve e simples.

**Localização:** `frontend/src/store.ts`

**Por que Zustand?**
- Simples e direto (sem boilerplate)
- Funciona com React Hooks
- Pequeno (~2KB)
- Performance otimizada

---

## 🏗️ Estrutura do Store

```typescript
import { useSyncExternalStore } from 'react'

// 1. Definir tipos
export type Usuario = {
  id?: number
  nome?: string
  email?: string
  ra?: string
  perfil?: string
  token?: string
}

export type Produto = {
  id: number
  nome: string
  preco: number
  estoque: number
}

// 2. Definir estado inicial
const authState: AuthState = {
  usuario: null
}

// 3. Criar listeners para notificar mudanças
const authListeners = new Set<() => void>()

// 4. Função para notificar
function notify(listeners: Set<() => void>) {
  listeners.forEach(listener => listener())
}

// 5. Criar hook
export function useAuthStore() {
  const snapshot = useSyncExternalStore(
    (listener) => {
      authListeners.add(listener)
      return () => authListeners.delete(listener)
    },
    () => authState
  )

  return {
    usuario: snapshot.usuario,
    setUsuario: (user) => {
      authState.usuario = user
      notify(authListeners)
    }
  }
}
```

---

## 👤 Auth Store

**Descrição:** Armazena dados do usuário autenticado.

### Estado

```typescript
type AuthState = {
  usuario: Usuario | null
}

const authState: AuthState = {
  usuario: null
}
```

### Hook: useAuthStore()

```typescript
export function useAuthStore() {
  const snapshot = useSyncExternalStore(...)
  
  return {
    usuario: snapshot.usuario,
    setUsuario: setAuthUsuario
  }
}
```

### Métodos

#### setUsuario(user)
Define o usuário autenticado.

```typescript
function setAuthUsuario(usuario: Usuario | null) {
  authState.usuario = usuario
  notify(authListeners)
}
```

**Uso:**
```typescript
const { setUsuario } = useAuthStore()

// Após login
setUsuario({
  id: 1,
  email: 'joao@example.com',
  nome: 'João Silva',
  perfil: 'CLIENTE',
  token: 'eyJ...'
})

// Após logout
setUsuario(null)
```

### Casos de Uso

**1. Verificar se usuário está logado**
```typescript
export function HomePage() {
  const usuario = useAuthStore().usuario
  
  if (!usuario) {
    return <Navigate to="/login" />
  }
  
  return <h1>Bem-vindo, {usuario.nome}!</h1>
}
```

**2. Obter dados do usuário**
```typescript
export function Header() {
  const usuario = useAuthStore().usuario
  
  if (!usuario) {
    return <div>Não autenticado</div>
  }
  
  return (
    <div className="flex items-center gap-2">
      <span>{usuario.nome}</span>
      <button onClick={handleLogout}>Sair</button>
    </div>
  )
}
```

**3. Fazer logout**
```typescript
function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  const { setUsuario } = useAuthStore.getState()
  setUsuario(null)
  
  navigate('/login')
}
```

### Acesso Global

```typescript
// Dentro de um useEffect ou callback
const usuarioAtual = useAuthStore.getState().usuario

// Setar também globalmente
useAuthStore.setUsuario({...})
```

---

## 🛒 Carrinho Store

**Descrição:** Armazena itens do carrinho de compras.

### Estado

```typescript
type CarrinhoState = {
  carrinho: Carrinho
}

type Carrinho = {
  itens: CarrinhoItem[]
}

type CarrinhoItem = {
  id: number
  produtoId: number
  produto: Produto
  quantidade: number
}
```

### Hook: useCarrinhoStore()

```typescript
export function useCarrinhoStore() {
  const snapshot = useSyncExternalStore(...)
  
  return {
    carrinho: snapshot.carrinho,
    setCarrinho: setCarrinhoState
  }
}
```

### Métodos

#### setCarrinho(carrinho)
Define o carrinho completo.

```typescript
function setCarrinhoState(carrinho: Carrinho) {
  carrinhoState.carrinho = carrinho
  notify(carrinhoListeners)
}
```

**Uso:**
```typescript
const { setCarrinho } = useCarrinhoStore()

// Carrega carrinho da API
const response = await carrinhoAPI.obter()
setCarrinho(response.data)
```

### Casos de Uso

**1. Exibir quantidade de itens**
```typescript
export function CartIcon() {
  const carrinho = useCarrinhoStore().carrinho
  const quantidade = carrinho.itens.length
  
  return (
    <Link to="/carrinho">
      🛒 ({quantidade})
    </Link>
  )
}
```

**2. Listar itens do carrinho**
```typescript
export function CarrinhoPage() {
  const carrinho = useCarrinhoStore().carrinho
  
  return (
    <div>
      {carrinho.itens.map(item => (
        <CarrinhoItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  )
}
```

**3. Calcular total**
```typescript
export function ResumoCarrinho() {
  const carrinho = useCarrinhoStore().carrinho
  
  const total = carrinho.itens.reduce((sum, item) => {
    return sum + (item.produto.preco * item.quantidade)
  }, 0)
  
  return <h2>Total: R$ {total.toFixed(2)}</h2>
}
```

**4. Limpar carrinho**
```typescript
function handleFinalizarCompra() {
  // Processa pedido
  
  // Limpa carrinho
  const { setCarrinho } = useCarrinhoStore.getState()
  setCarrinho({ itens: [] })
  
  navigate('/pedidos')
}
```

---

## 🔄 Sincronização com Backend

### Sincronizar na Montagem

```typescript
export function App() {
  useEffect(() => {
    // Carrega carrinho da API
    const carregarCarrinho = async () => {
      try {
        const response = await carrinhoAPI.obter()
        useCarrinhoStore.setCarrinho(response.data)
      } catch (err) {
        console.error('Erro ao carregar carrinho')
      }
    }

    carregarCarrinho()
  }, [])

  return <Routes>...</Routes>
}
```

### Sincronizar Após Ação

```typescript
async function handleAdicionarAoCarrinho(produtoId: number) {
  try {
    // Chamada à API
    await carrinhoAPI.adicionar(produtoId, 1)
    
    // Recarrega carrinho
    const response = await carrinhoAPI.obter()
    useCarrinhoStore.setCarrinho(response.data)
    
    showToast('Adicionado ao carrinho!')
  } catch (err) {
    showToast('Erro ao adicionar', 'error')
  }
}
```

---

## 💾 Persistência no localStorage

### Salvar Automaticamente

```typescript
// Em App.tsx, monitorar mudanças
export function App() {
  useEffect(() => {
    const { usuario } = useAuthStore()
    
    if (usuario) {
      localStorage.setItem('user', JSON.stringify(usuario))
    } else {
      localStorage.removeItem('user')
    }
  }, [useAuthStore().usuario])

  return <Routes>...</Routes>
}
```

### Restaurar ao Iniciar

```typescript
export function App() {
  useEffect(() => {
    // Restaura usuário do localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const usuario = JSON.parse(savedUser)
        useAuthStore.setUsuario(usuario)
      } catch (err) {
        console.error('Erro ao restaurar usuário')
      }
    }
  }, [])

  return <Routes>...</Routes>
}
```

---

## 🔐 Proteção de Rota com Store

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'CLIENTE' | 'VENDEDOR'
}

export function ProtectedRoute({
  children,
  requiredRole
}: ProtectedRouteProps) {
  const usuario = useAuthStore().usuario
  
  // Sem autenticação
  if (!usuario) {
    return <Navigate to="/login" />
  }
  
  // Role obrigatório não coincide
  if (requiredRole && usuario.perfil !== requiredRole) {
    return <Navigate to="/" />
  }
  
  // Autorizado
  return <>{children}</>
}

// Uso:
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

## 📊 Fluxo de Dados

```
App.tsx
  ├─ useAuthStore()
  │   ├─ LoginPage: setUsuario após login
  │   ├─ Header: exibe dados do usuário
  │   └─> Lógica de proteção de rotas
  │
  └─ useCarrinhoStore()
      ├─ ProdutoDetalhePage: adiciona item
      ├─ CarrinhoPage: lista itens
      ├─ CartIcon: mostra quantidade
      └─> Checkout: cria pedido
```

---

## ⚙️ Boas Práticas

### ✅ Faça

```typescript
// 1. Usar hook dentro de componentes
export function MyComponent() {
  const usuario = useAuthStore().usuario
  
  return <div>{usuario?.email}</div>
}

// 2. Atualizar estado via método do store
const { setUsuario } = useAuthStore()
setUsuario(newUser)

// 3. Sincronizar com localStorage
useEffect(() => {
  const saved = localStorage.getItem('user')
  if (saved) {
    setUsuario(JSON.parse(saved))
  }
}, [])
```

### ❌ Evite

```typescript
// 1. Modificar estado diretamente
authState.usuario = { ... }  // ❌ NÃO!

// 2. Acessar estado fora do React
function regularFunction() {
  // ❌ Não funciona aqui
  const store = useAuthStore()
}

// 3. Criar múltiplos stores para mesma coisa
const [user, setUser] = useState()  // ❌ Se já existe no store
```

---

## 🔌 Alternativas ao Zustand

Se preferir, pode usar:
- **Redux** - Mais robusto, mais boilerplate
- **Context API** - Nativo do React, simpler
- **Recoil** - Facebook, experimental
- **Jotai** - Similar ao Zustand

---

## 🎯 Próximos Passos

- Veja [01_PAGES.md](./01_PAGES.md) para ver uso prático
- Veja [05_ROUTING.md](./05_ROUTING.md) para roteamento
- Veja [03_LIB_SERVICES.md](./03_LIB_SERVICES.md) para chamadas à API
