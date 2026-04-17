# 🧩 Frontend - Componentes React (Components)

## 📋 Visão Geral

Os componentes (Components) são blocos reutilizáveis de UI que podem ser usados em várias páginas.

**Localização:** `frontend/src/components/`

**Padrão:** Componentes React com extensão `.tsx`

---

## 🎨 Layout

**Arquivo:** `Layout.tsx`

**Descrição:** Layout principal que envolve todas as páginas, com header, footer e navegação.

### Estrutura

```typescript
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <nav className="bg-blue-600 text-white">
        <NavigationMenu />
      </nav>
      
      <main className="flex-1 container mx-auto py-8">
        {children}
      </main>
      
      <Footer />
    </div>
  )
}
```

### Sub-componentes

#### Header
- Logo do site
- Search bar
- Link do usuário (nome + dropdown com logout)
- Ícone do carrinho (com badge de quantidade)

```typescript
function Header() {
  const usuario = useAuthStore().usuario
  const carrinho = useCarrinhoStore().carrinho

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between p-4">
        <Logo href="/" />
        
        <SearchBar />
        
        <div className="flex gap-4">
          {usuario ? (
            <UserMenu usuario={usuario} />
          ) : (
            <div className="flex gap-2">
              <Link to="/login">Login</Link>
              <Link to="/cadastro">Cadastro</Link>
            </div>
          )}
          
          <CartIcon quantidade={carrinho.itens.length} />
        </div>
      </div>
    </header>
  )
}
```

#### NavigationMenu
- Links para categorias principais
- Link para home
- Link para meus pedidos (se autenticado)
- Link para minha loja (se vendedor)

#### Footer
- Informações da empresa
- Links úteis
- Redes sociais
- Copyright

---

## 🎨 UI (Componentes de Interface)

**Arquivo:** `UI.tsx`

**Descrição:** Componentes básicos de UI reutilizáveis (Button, Card, Input, etc).

### Componentes Disponíveis

#### Button
```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  fullWidth,
  size = 'md'
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

**Uso:**
```typescript
<Button onClick={handleClick}>Clique aqui</Button>
<Button variant="secondary" size="lg">Grande</Button>
<Button variant="danger" disabled>Desabilitado</Button>
```

---

#### Card
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className || ''}`}>
      {children}
    </div>
  )
}
```

**Uso:**
```typescript
<Card>
  <h2>Título</h2>
  <p>Conteúdo</p>
</Card>
```

---

#### Input
```typescript
interface InputProps {
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label
}: InputProps) {
  return (
    <div>
      {label && <label className="block mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  )
}
```

**Uso:**
```typescript
<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  value={email}
  onChange={setEmail}
  error={erros.email}
/>
```

---

#### Select
```typescript
interface Option {
  value: string | number
  label: string
}

interface SelectProps {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  label?: string
}

export function Select({
  options,
  value,
  onChange,
  label
}: SelectProps) {
  return (
    <div>
      {label && <label className="block mb-2">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

#### Badge
```typescript
export function Badge({
  children,
  variant = 'primary'
}: {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'danger'
}) {
  const colors = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800'
  }
  
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors[variant]}`}>
      {children}
    </span>
  )
}
```

---

#### Alert
```typescript
export function Alert({
  type = 'info',
  message
}: {
  type?: 'info' | 'success' | 'warning' | 'error'
  message: string
}) {
  const colors = {
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300'
  }
  
  return (
    <div className={`border-l-4 p-4 ${colors[type]}`}>
      {message}
    </div>
  )
}
```

---

## 🖼️ Componentes de Produto

### ProdutoCard
```typescript
interface ProdutoCardProps {
  produto: Produto
}

export function ProdutoCard({ produto }: ProdutoCardProps) {
  return (
    <Link to={`/produtos/${produto.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <h3 className="font-bold truncate">{produto.nome}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {produto.descricao}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="font-bold text-lg">
              R$ {produto.preco.toFixed(2)}
            </span>
            {produto.estoque > 0 ? (
              <Badge variant="success">Em estoque</Badge>
            ) : (
              <Badge variant="danger">Fora de estoque</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
```

---

### GridProdutos
```typescript
interface GridProdutosProps {
  produtos: Produto[]
  loading?: boolean
}

export function GridProdutos({
  produtos,
  loading
}: GridProdutosProps) {
  if (loading) return <LoadingSpinner />
  
  if (produtos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum produto encontrado</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {produtos.map(p => (
        <ProdutoCard key={p.id} produto={p} />
      ))}
    </div>
  )
}
```

---

## 🛒 Componentes do Carrinho

### CarrinhoItem
```typescript
interface CarrinhoItemProps {
  item: CarrinhoItem
  onRemove?: () => void
  onQuantidadeChange?: (quantidade: number) => void
}

export function CarrinhoItem({
  item,
  onRemove,
  onQuantidadeChange
}: CarrinhoItemProps) {
  return (
    <div className="flex gap-4 border-b pb-4">
      <img
        src={item.produto.imagem}
        alt={item.produto.nome}
        className="w-20 h-20 object-cover rounded"
      />
      
      <div className="flex-1">
        <h3 className="font-bold">{item.produto.nome}</h3>
        <p className="text-gray-600">R$ {item.produto.preco}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={item.quantidade}
          onChange={(e) => onQuantidadeChange?.(Number(e.target.value))}
          className="w-12 px-2 py-1 border rounded"
        />
      </div>
      
      <div className="text-right">
        <p className="font-bold">
          R$ {(item.produto.preco * item.quantidade).toFixed(2)}
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={onRemove}
        >
          Remover
        </Button>
      </div>
    </div>
  )
}
```

---

## 🔄 Componentes Utilitários

### LoadingSpinner
```typescript
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
```

---

### EmptyState
```typescript
export function EmptyState({
  title,
  description,
  action
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  )
}
```

---

### Modal
```typescript
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({
  open,
  onClose,
  title,
  children
}: ModalProps) {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        {children}
      </Card>
    </div>
  )
}
```

---

## 🔐 Componentes de Autenticação

### ProtectedRoute
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({
  children,
  requiredRole
}: ProtectedRouteProps) {
  const usuario = useAuthStore().usuario
  
  if (!usuario) {
    return <Navigate to="/login" />
  }
  
  if (requiredRole && usuario.perfil !== requiredRole) {
    return <Navigate to="/acesso-negado" />
  }
  
  return <>{children}</>
}
```

**Uso:**
```typescript
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

## 📊 Props Pattern

Componentes seguem este padrão:

```typescript
interface ComponentProps {
  // Props obrigatórias primeiro
  required: string
  // Props opcionais
  optional?: string
  // Callbacks
  onChange?: (value: string) => void
  // Classes customizadas
  className?: string
}

export function Component({
  required,
  optional = 'padrão',
  onChange,
  className
}: ComponentProps) {
  return (
    // JSX
  )
}
```

---

## 🎨 Tailwind CSS Classes

Componentes usam Tailwind CSS. Principais classes:

```
Espaçamento: p-4, m-2, gap-4
Cores: bg-blue-600, text-white, border-gray-300
Tamanhos: w-full, h-12, max-w-md
Flexbox: flex, justify-between, items-center
Grid: grid, grid-cols-4, col-span-2
Responsivo: sm:, md:, lg:
Efeitos: hover:, shadow, rounded-lg
```

---

## 🎯 Próximos Passos

- Veja [01_PAGES.md](./01_PAGES.md) para páginas completas
- Veja [03_LIB_SERVICES.md](./03_LIB_SERVICES.md) para serviços de API
- Veja [04_STORE.md](./04_STORE.md) para gerenciamento de estado
