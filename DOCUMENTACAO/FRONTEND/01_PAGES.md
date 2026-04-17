# ⚛️ Frontend - Páginas (Pages)

## 📋 Visão Geral

As páginas (Pages) são componentes React que representam uma rota/tela completa da aplicação.

**Localização:** `frontend/src/pages/`

**Padrão:** Cada página é um componente React com extensão `.tsx`

---

## 🏠 HomePage

**Arquivo:** `HomePage.tsx`

**Descrição:** Página inicial da aplicação, exibe produtos destacados e categorias.

### Funcionalidades

- Exibe lista de produtos em destaque
- Mostra categorias disponíveis
- Link para explorar cada categoria
- Banner/hero section
- Filtros básicos de busca

### Estrutura

```typescript
export function HomePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carrega produtos e categorias ao montar
    carregarDados()
  }, [])

  return (
    <Layout>
      <BannerHero />
      <SectionCategorias categorias={categorias} />
      <SectionProdutosDestaque produtos={produtos} />
    </Layout>
  )
}
```

### Componentes Internos

- `BannerHero` - Seção de welcome
- `SectionCategorias` - Grid de categorias
- `SectionProdutosDestaque` - Grid de produtos

### Dados Carregados

```typescript
GET / api / categorias; // Lista categorias
GET / api / produtos; // Lista produtos
```

---

## 🔐 LoginPage

**Arquivo:** `LoginPage.tsx`

**Descrição:** Página de autenticação - onde usuários fazem login.

### Funcionalidades

- Formulário de login (email + senha)
- Validação de campos
- Mensagens de erro
- Link para cadastro
- Redirecionamento após login bem-sucedido

### Componentes

```typescript
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)

    try {
      // Valida campos
      if (!email.trim()) throw new Error('Email é obrigatório')
      if (!senha) throw new Error('Senha é obrigatória')

      // Chama API
      const response = await authAPI.login(email, senha)

      // Salva token
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Atualiza estado global
      const { setUsuario } = useAuthStore.getState()
      setUsuario(response.data.user)

      // Redireciona
      navigate('/home')
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient">
      <Card>
        <form onSubmit={handleLogin}>
          <InputField
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={setEmail}
          />
          <InputField
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={setSenha}
          />
          {erro && <ErrorAlert>{erro}</ErrorAlert>}
          <Button type="submit" disabled={carregando}>
            {carregando ? 'Carregando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

### Fluxo

```
1. Usuário preenche email/senha
2. Clica em "Entrar"
3. Validações locais
4. POST /api/auth/login
5. Se sucesso:
   - Salva token no localStorage
   - Salva usuário no estado
   - Redireciona para /home
6. Se erro:
   - Exibe mensagem de erro
```

### Rotas Relacionadas

- `<Link to="/cadastro">` - Ir para cadastro

---

## 📝 CadastroPage

**Arquivo:** `CadastroPage.tsx`

**Descrição:** Página de registro - onde novos usuários criam conta.

### Funcionalidades

- Formulário de cadastro completo
- Validação de campos (email único, RA único, etc)
- Upload de foto (opcional)
- Confirmação de senha
- Redirecionamento após registro

### Campos do Formulário

```typescript
{
  nomeCompleto: string; // Campo obrigatório
  email: string; // Campo obrigatório, deve ser único
  ra: string; // Registro acadêmico, obrigatório e único
  senha: string; // Campo obrigatório
  confirmarSenha: string; // Validar igualdade
  cpfCnpj: string; // Opcional
  dataNascimento: string; // Formato: YYYY-MM-DD
  instituicao: string; // Nome da universidade
  cidade: string; // Cidade
  perfil: string; // CLIENTE ou VENDEDOR
}
```

### Exemplo de Componente

```typescript
export function CadastroPage() {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    ra: '',
    senha: '',
    confirmarSenha: '',
    // ... outros campos
  })
  const [erros, setErros] = useState<Record<string, string>>({})

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErros({})

    // Validações
    const novoErros: Record<string, string> = {}

    if (!formData.nomeCompleto) novoErros.nomeCompleto = 'Obrigatório'
    if (!formData.email) novoErros.email = 'Obrigatório'
    if (formData.senha !== formData.confirmarSenha) {
      novoErros.confirmarSenha = 'Senhas não conferem'
    }

    if (Object.keys(novoErros).length > 0) {
      setErros(novoErros)
      return
    }

    try {
      const response = await authAPI.register(formData)
      localStorage.setItem('token', response.data.token)
      useAuthStore.setUsuario(response.data.user)
      navigate('/home')
    } catch (err: any) {
      setErros({ geral: err.response?.data?.message })
    }
  }

  return (
    <Layout>
      <Card>
        <form onSubmit={handleCadastro}>
          {/* Campos do formulário */}
          <Button type="submit">Cadastrar</Button>
        </form>
      </Card>
    </Layout>
  )
}
```

---

## 📦 ProdutosPage

**Arquivo:** `ProdutosPage.tsx`

**Descrição:** Página que lista todos os produtos com filtros.

### Funcionalidades

- Lista de produtos com paginação
- Filtro por categoria
- Busca por nome/descrição
- Ordenação por preço/popularidade
- Link para detalhe do produto

### Componentes

```typescript
export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [filtros, setFiltros] = useState({
    categoria: null,
    busca: '',
    ordenacao: 'nome'
  })
  const [pagina, setPagina] = useState(0)

  useEffect(() => {
    carregarProdutos()
  }, [filtros, pagina])

  const carregarProdutos = async () => {
    const params = {
      categoria: filtros.categoria,
      busca: filtros.busca,
      sort: filtros.ordenacao,
      page: pagina,
      size: 12
    }
    const response = await produtoAPI.listar(params)
    setProdutos(response.data)
  }

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <FiltrosProdutos
            filtros={filtros}
            onChange={setFiltros}
          />
        </aside>

        <main className="col-span-9">
          <GridProdutos
            produtos={produtos}
            onPaginaChange={setPagina}
          />
        </main>
      </div>
    </Layout>
  )
}
```

### URL: `/produtos`

---

## 🔍 ProdutoDetalhePage

**Arquivo:** `ProdutoDetalhePage.tsx`

**Descrição:** Página que exibe detalhes completos de um produto.

### Funcionalidades

- Imagem grande do produto
- Descrição detalhada
- Preço e estoque
- Informações do vendedor
- Botão "Adicionar ao Carrinho"
- Produtos relacionados
- Avaliações/comentários

### Componentes

```typescript
export function ProdutoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    carregarProduto()
  }, [id])

  const carregarProduto = async () => {
    const response = await produtoAPI.buscarPorId(Number(id))
    setProduto(response.data)
  }

  const handleAdicionarCarrinho = async () => {
    try {
      await carrinhoAPI.adicionar(produto.id, quantidade)
      // Mostra notificação
      showToast('Produto adicionado ao carrinho!')
    } catch (err) {
      showToast('Erro ao adicionar', 'error')
    }
  }

  return (
    <Layout>
      <div className="grid grid-cols-2 gap-8">
        <GaleriaImagensProduto produto={produto} />

        <div>
          <h1>{produto?.nome}</h1>
          <p className="text-2xl font-bold">{produto?.preco}</p>
          <p className="text-sm">Estoque: {produto?.estoque}</p>

          <div className="flex gap-4">
            <InputQuantidade
              value={quantidade}
              onChange={setQuantidade}
              max={produto?.estoque}
            />
            <Button
              onClick={handleAdicionarCarrinho}
              disabled={quantidade === 0}
            >
              Adicionar ao Carrinho
            </Button>
          </div>

          <InformacaoesVendedor vendedor={produto?.vendedor} />
          <ProdutosRelacionados categoria={produto?.categoria} />
        </div>
      </div>
    </Layout>
  )
}
```

### URL: `/produtos/:id`

---

## 🛒 CarrinhoPage

**Arquivo:** `CarrinhoPage.tsx`

**Descrição:** Página do carrinho de compras.

### Funcionalidades

- Lista de itens no carrinho
- Botão para remover item
- Alterar quantidade
- Calcular total
- Botão para checkout
- Carrinho vazio - sugestão de continuar comprando

### Componentes

```typescript
export function CarrinhoPage() {
  const carrinho = useCarrinhoStore().carrinho
  const [carregando, setCarregando] = useState(false)

  const calcularTotal = () => {
    return carrinho.itens.reduce((total, item) => {
      return total + (item.produto.preco * item.quantidade)
    }, 0)
  }

  const handleRemover = async (idProduto: number) => {
    await carrinhoAPI.remover(idProduto)
    // Atualiza estado
  }

  const handleCheckout = async () => {
    setCarregando(true)
    try {
      await pedidoAPI.criarPedido(carrinho)
      showToast('Pedido realizado com sucesso!')
      navigate('/pedidos')
    } catch (err) {
      showToast('Erro ao realizar pedido', 'error')
    } finally {
      setCarregando(false)
    }
  }

  if (carrinho.itens.length === 0) {
    return (
      <Layout>
        <EmptyState
          title="Carrinho vazio"
          description="Comece a comprar!"
          action={<Link to="/produtos">Ver Produtos</Link>}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {carrinho.itens.map(item => (
            <CarrinhoItem
              key={item.id}
              item={item}
              onRemove={() => handleRemover(item.produtoId)}
            />
          ))}
        </div>

        <aside className="bg-gray-50 p-6 rounded">
          <h2>Resumo</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{calcularTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Frete:</span>
              <span>R$ 10.00</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>
                R$ {(calcularTotal() + 10).toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={carregando}
            fullWidth
          >
            {carregando ? 'Processando...' : 'Finalizar Compra'}
          </Button>
        </aside>
      </div>
    </Layout>
  )
}
```

### URL: `/carrinho`

---

## 📋 PedidosPage

**Arquivo:** `PedidosPage.tsx`

**Descrição:** Página que lista pedidos do usuário.

### Funcionalidades

- Lista de pedidos com status
- Data do pedido
- Total do pedido
- Link para detalhe do pedido
- Filtro por status (Pendente, Enviado, Entregue)

---

## 👤 ContaPage

**Arquivo:** `ContaPage.tsx`

**Descrição:** Página de configurações da conta do usuário.

### Funcionalidades

- Exibir dados do usuário
- Editar perfil
- Alterar senha
- Listar endereços
- Adicionar novo endereço
- Botão logout

---

## 🏷️ CategoriasPage

**Arquivo:** `CategoriasPage.tsx`

**Descrição:** Página que lista todas as categorias.

### Funcionalidades

- Grid de categorias
- Imagem representativa
- Quantidade de produtos
- Link para ver produtos da categoria

---

## 💬 ChatPage

**Arquivo:** `ChatPage.tsx`

**Descrição:** Página de chat (para interação com vendedor ou suporte).

### Funcionalidades

- Lista de conversas
- Área de mensagens
- Input para digitar mensagem
- Timestamps

---

## 🛍️ CadastrarProdutoPage

**Arquivo:** `CadastrarProdutoPage.tsx`

**Descrição:** Página onde vendedores podem cadastrar/editar produtos.

### Funcionalidades

- Formulário de cadastro de produto
- Upload de imagens
- Preço e estoque
- Descrição e especificações
- Categoria
- Validação de campos

### Formulário

```typescript
{
  nome: string
  descricao: string
  preco: number
  estoque: number
  categoria: string
  peso: number
  dimensoes: string
  imagens: File[]
}
```

---

## 🎯 Fluxo de Navegação

```
HomePage (/)
├── Link: Explorar Categorias
│   └─> CategoriasPage (/categorias)
│       └─> ProdutosPage (/produtos?categoria=x)
│
├── Link: Ver Produtos
│   └─> ProdutosPage (/produtos)
│       └─> ProdutoDetalhePage (/produtos/:id)
│           └─> CarrinhoPage (/carrinho)
│               └─> Checkout → PedidosPage (/pedidos)
│
├── Link: Login
│   └─> LoginPage (/login)
│
├── Link: Cadastro
│   └─> CadastroPage (/cadastro)
│
└── Link: Conta (após login)
    └─> ContaPage (/conta)
        └─> CadastrarProdutoPage (/cadastrar-produto)
```

---

## 📊 Estado Global por Página

### HomePage

- Produtos destacados
- Categorias

### LoginPage

- Email
- Senha

### ProdutosPage

- Lista de produtos
- Filtros
- Paginação

### CarrinhoPage

- Carrinho (from store)
- Itens

### ContaPage

- Usuário (from store)
- Endereços

---

## 🎯 Próximos Passos

- Veja [02_COMPONENTS.md](./02_COMPONENTS.md) para componentes reutilizáveis
- Veja [03_LIB_SERVICES.md](./03_LIB_SERVICES.md) para serviços de API
- Veja [04_STORE.md](./04_STORE.md) para gerenciamento de estado
