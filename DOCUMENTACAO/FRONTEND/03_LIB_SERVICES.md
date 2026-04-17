# 🔗 Frontend - Serviços e Bibliotecas (Lib)

## 📋 Visão Geral

Os serviços (Services) na pasta `lib/` lidam com:
- Comunicação com API backend
- Autenticação e tokenização
- Utilitários gerais
- Mock de dados

**Localização:** `frontend/src/lib/`

---

## 🌐 api.ts

**Arquivo:** `api.ts`

**Descrição:** Instância global do Axios com configuração de interceptadores.

### Configuração Básica

```typescript
import axios, { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
```

### Request Interceptor
```typescript
// Adiciona token JWT a todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})
```

**O que faz:**
1. Lê token do localStorage
2. Adiciona ao header `Authorization: Bearer <token>`
3. Todas as requisições subsequentes incluem o token

### Response Interceptor
```typescript
api.interceptors.response.use(
  (response) => response,  // Sucesso
  (error) => {
    // Se token expirou (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'  // Redireciona para login
    }
    
    return Promise.reject(error)
  }
)
```

**O que faz:**
1. Intercepta respostas
2. Se erro 401 (não autenticado):
   - Remove token e usuário do localStorage
   - Redireciona para página de login
3. Rejeita erro para tratamento no componente

### Exemplo de Uso

```typescript
// GET
const response = await api.get('/api/produtos')

// POST
const response = await api.post('/api/auth/login', {
  email: 'joao@example.com',
  senha: 'password'
})

// PUT
await api.put('/api/produtos/1', {
  nome: 'Novo nome'
})

// DELETE
await api.delete('/api/carrinho/1')
```

---

## 🔐 api-service.ts

**Arquivo:** `api-service.ts`

**Descrição:** Serviços de API organizados por domínio/recurso.

### authAPI

```typescript
export const authAPI = {
  // Registra novo usuário
  async register(data: RegisterRequest) {
    return api.post('/api/auth/register', data)
  },
  
  // Faz login
  async login(email: string, senha: string) {
    return api.post('/api/auth/login', { email, senha })
  },
  
  // Obtém dados do usuário autenticado
  async me() {
    return api.get('/api/auth/me')
  },
  
  // Faz logout (opcional, já que JWT é stateless)
  async logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return Promise.resolve()
  }
}
```

**Uso:**
```typescript
// Login
const response = await authAPI.login('joao@example.com', 'senha123')
const token = response.data.token
localStorage.setItem('token', token)

// Buscar dados do usuário
const userData = await authAPI.me()
console.log(userData.data.email)
```

---

### produtoAPI

```typescript
export const produtoAPI = {
  // Lista produtos com filtros
  async listar(params?: {
    categoria?: number
    busca?: string
    pagina?: number
    tamanho?: number
  }) {
    return api.get('/api/produtos', { params })
  },
  
  // Busca um produto por ID
  async buscarPorId(id: number) {
    return api.get(`/api/produtos/${id}`)
  },
  
  // Cria novo produto (requer autenticação)
  async criar(data: CreateProdutoRequest) {
    return api.post('/api/produtos', data)
  },
  
  // Atualiza um produto
  async atualizar(id: number, data: UpdateProdutoRequest) {
    return api.put(`/api/produtos/${id}`, data)
  },
  
  // Deleta um produto
  async deletar(id: number) {
    return api.delete(`/api/produtos/${id}`)
  }
}
```

**Uso:**
```typescript
// Listar produtos
const produtos = await produtoAPI.listar({
  categoria: 1,
  busca: 'notebook',
  pagina: 0,
  tamanho: 10
})

// Buscar um produto
const produto = await produtoAPI.buscarPorId(1)

// Criar produto (vendedor)
await produtoAPI.criar({
  nomeProduto: 'Novo',
  descricao: 'Descrição',
  preco: 100.00,
  estoque: 5,
  idCategoria: 1
})
```

---

### carrinhoAPI

```typescript
export const carrinhoAPI = {
  // Obtém carrinho do usuário
  async obter() {
    return api.get('/api/carrinho')
  },
  
  // Adiciona produto ao carrinho
  async adicionar(idProduto: number, quantidade: number) {
    return api.post('/api/carrinho/adicionar', {
      idProduto,
      quantidade
    })
  },
  
  // Remove produto do carrinho
  async remover(idProduto: number) {
    return api.delete(`/api/carrinho/remover/${idProduto}`)
  },
  
  // Limpa o carrinho
  async limpar() {
    return api.post('/api/carrinho/limpar')
  }
}
```

---

### categoriaAPI

```typescript
export const categoriaAPI = {
  // Lista todas as categorias
  async listar() {
    return api.get('/api/categorias')
  },
  
  // Busca uma categoria por ID
  async buscarPorId(id: number) {
    return api.get(`/api/categorias/${id}`)
  }
}
```

---

### usuarioAPI

```typescript
export const usuarioAPI = {
  // Busca dados de um usuário
  async buscarPorId(id: number) {
    return api.get(`/api/usuarios/${id}`)
  },
  
  // Atualiza dados do usuário
  async atualizar(id: number, data: UpdateUsuarioRequest) {
    return api.put(`/api/usuarios/${id}`, data)
  },
  
  // Deleta usuário (soft delete)
  async deletar(id: number) {
    return api.delete(`/api/usuarios/${id}`)
  }
}
```

---

## 🔐 auth-listener.ts

**Arquivo:** `auth-listener.ts`

**Descrição:** Utilitários para gerenciar autenticação.

```typescript
// Verifica se há token armazenado
export function hasAuthToken(): boolean {
  return !!localStorage.getItem('token')
}

// Obtém token do localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('token')
}

// Salva token no localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('token', token)
}

// Remove token
export function removeAuthToken(): void {
  localStorage.removeItem('token')
}

// Obtém usuário armazenado
export function getStoredUser(): Usuario | null {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Listener para mudanças de autenticação
export function addAuthListener(callback: (user: Usuario | null) => void) {
  // Monitora mudanças no localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'user') {
      const user = e.newValue ? JSON.parse(e.newValue) : null
      callback(user)
    }
  })
}
```

**Uso:**
```typescript
import { hasAuthToken, getStoredUser } from '@/lib/auth-listener'

if (hasAuthToken()) {
  const user = getStoredUser()
  console.log('Usuário:', user.email)
}
```

---

## 🛒 shop-storage.ts

**Arquivo:** `shop-storage.ts`

**Descrição:** Utilitários para armazenar dados do carrinho no localStorage.

```typescript
// Chaves do localStorage
const STORAGE_KEYS = {
  CARRINHO: 'campushop_carrinho',
  HISTORICO_BUSCAS: 'campushop_historico_buscas'
}

// Salva carrinho no localStorage
export function salvarCarrinho(carrinho: Carrinho): void {
  localStorage.setItem(
    STORAGE_KEYS.CARRINHO,
    JSON.stringify(carrinho)
  )
}

// Carrega carrinho do localStorage
export function carregarCarrinho(): Carrinho {
  const data = localStorage.getItem(STORAGE_KEYS.CARRINHO)
  return data ? JSON.parse(data) : { itens: [] }
}

// Limpa carrinho
export function limparCarrinho(): void {
  localStorage.removeItem(STORAGE_KEYS.CARRINHO)
}

// Adiciona busca ao histórico
export function adicionarAoHistorico(termo: string): void {
  const historico = carregarHistorico()
  
  // Evita duplicatas
  if (!historico.includes(termo)) {
    historico.unshift(termo)  // Adiciona no início
    
    // Mantém apenas os últimos 10
    if (historico.length > 10) {
      historico.pop()
    }
    
    localStorage.setItem(
      STORAGE_KEYS.HISTORICO_BUSCAS,
      JSON.stringify(historico)
    )
  }
}

// Carrega histórico de buscas
export function carregarHistorico(): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORICO_BUSCAS)
  return data ? JSON.parse(data) : []
}
```

---

## 📊 mock-data.ts

**Arquivo:** `mock-data.ts`

**Descrição:** Dados de teste/mock para desenvolvimento.

```typescript
export const mockCategorias: Categoria[] = [
  {
    id: 1,
    nome: 'Eletrônicos',
    descricao: 'Produtos eletrônicos em geral',
    imagem: '/images/categorias/eletronicos.jpg'
  },
  {
    id: 2,
    nome: 'Livros',
    descricao: 'Livros acadêmicos e técnicos',
    imagem: '/images/categorias/livros.jpg'
  },
  // ...
]

export const mockProdutos: Produto[] = [
  {
    id: 1,
    nome: 'Notebook Gamer',
    descricao: 'Notebook com RTX 4090',
    preco: 5000.00,
    estoque: 10,
    categoria: 1,
    imagem: '/images/produtos/notebook.jpg',
    vendedor_id: 1
  },
  // ...
]

export const mockUsuario: Usuario = {
  id: 1,
  nomeCompleto: 'João Silva',
  email: 'joao@example.com',
  ra: '2022001234',
  perfil: 'CLIENTE',
  token: 'eyJ...'
}

// Retorna dados mock baseado no endpoint (para development)
export function getMockData(endpoint: string) {
  const mockMap: Record<string, any> = {
    '/api/categorias': mockCategorias,
    '/api/produtos': mockProdutos,
    '/api/auth/me': mockUsuario
  }
  
  return mockMap[endpoint]
}
```

**Uso em Development:**
```typescript
// Se backend não está disponível, usar mock
const useMock = process.env.REACT_APP_USE_MOCK === 'true'

if (useMock) {
  const data = getMockData('/api/produtos')
  setProdutos(data)
}
```

---

## 📋 Tipos TypeScript Definidos

Geralmente em um arquivo `types.ts` ou no topo do `api-service.ts`:

```typescript
// Auth
export interface LoginRequest {
  email: string
  senha: string
}

export interface RegisterRequest {
  nomeCompleto: string
  email: string
  ra: string
  senha: string
  cpfCnpj: string
  dataNascimento: string
  instituicao: string
  cidade: string
  perfil: string
}

export interface AuthResponse {
  token: string
  user: Usuario
}

// Produtos
export interface CreateProdutoRequest {
  nomeProduto: string
  descricao: string
  preco: number
  estoque: number
  idCategoria: number
}

export interface UpdateProdutoRequest
  extends Partial<CreateProdutoRequest> {}

// Carrinho
export interface AddCarrinhoRequest {
  idProduto: number
  quantidade: number
}
```

---

## 🔄 Padrão de Erro

Todos os serviços retornam respostas com erro padronizado:

```typescript
try {
  const response = await produtoAPI.buscarPorId(1)
  // response.data contem os dados
} catch (error) {
  // error.response.status = código de erro (400, 401, 404, 500)
  // error.response.data.message = mensagem de erro
  // error.message = erro genérico do axios
}
```

---

## 🎯 Próximos Passos

- Veja [04_STORE.md](./04_STORE.md) para gerenciamento de estado
- Veja [01_PAGES.md](./01_PAGES.md) para ver como páginas usam estes serviços
- Veja [05_ROUTING.md](./05_ROUTING.md) para roteamento
