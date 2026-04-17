# ⚙️ Backend - Serviços (Services)

## 📋 Visão Geral

Os serviços (Services) contêm toda a lógica de negócio da aplicação. Eles:
- Realizam validações complexas
- Executam operações sobre dados
- Chamam repositórios para persistência
- Implementam regras de negócio
- Lançam exceções para erro de negócio

**Localização:** `src/main/java/br/com/campushop/campushop_backend/service/`

**Padrão:** Cada Service tem uma interface `IService` (se necessário)

---

## 👤 UsuarioService

**Arquivo:** `UsuarioService.java`

**Descrição:** Gerencia operações relacionadas a usuários.

### Anotação
```java
@Service
public class UsuarioService { }
```

### Dependências Injetadas

```java
@Autowired
private UsuarioRepository usuarioRepository;

@Autowired
private PasswordEncoder passwordEncoder;

@Autowired
private UsuarioValidator usuarioValidator;
```

### Métodos Principais

#### 1. **salvar(Usuario usuario)**
Salva um novo usuário no banco de dados.

```java
public Usuario salvar(Usuario usuario) {
    // Validações
    usuarioValidator.validarUsuario(
        usuario.getNomeCompleto(),
        usuario.getEmail(),
        usuario.getCpfCnpj(),
        usuario.getDataNascimento(),
        usuario.getRa()
    );
    
    // Normalização
    usuario.setEmail(usuario.getEmail().trim().toLowerCase());
    usuario.setRa(usuario.getRa().trim());
    
    // Verificações de negócio
    if (usuarioRepository.existsByEmail(usuario.getEmail())) {
        throw new RuntimeException("Email já cadastrado");
    }
    if (usuarioRepository.existsByRa(usuario.getRa())) {
        throw new RuntimeException("RA já cadastrado");
    }
    
    // Criptografa a senha
    usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
    
    // Persiste no BD
    Usuario salvo = usuarioRepository.save(usuario);
    
    logger.info("Usuário salvo com sucesso! ID: {}", salvo.getId());
    return salvo;
}
```

**Lógica:**
1. Valida dados usando UsuarioValidator
2. Normaliza email e RA
3. Verifica se email/RA já existem (regra de negócio)
4. Criptografa senha com BCrypt
5. Salva no banco
6. Retorna usuário com ID gerado

**Exceções:**
- `RuntimeException` se email ou RA já cadastrado

---

#### 2. **buscarPorEmail(String email)**
Busca um usuário pelo email.

```java
public Optional<Usuario> buscarPorEmail(String email) {
    return usuarioRepository.findByEmail(email);
}
```

**Retorno:**
- `Optional.of(usuario)` se encontrado
- `Optional.empty()` se não encontrado

**Uso:**
```java
Optional<Usuario> usuario = usuarioService.buscarPorEmail("joao@example.com");
if (usuario.isPresent()) {
    // Usuário existe
} else {
    // Usuário não existe
}
```

---

#### 3. **autenticar(String email, String senha)**
Verifica se as credenciais estão corretas.

```java
public boolean autenticar(String email, String senha) {
    Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
    return usuarioOpt.map(usuario -> {
        String senhaSalva = usuario.getSenha();
        
        if (senhaSalva == null) {
            return false;
        }
        
        // Verifica se é BCrypt (com hash "$2a$", "$2b$" ou "$2y$")
        if (senhaSalva.startsWith("$2a$") || 
            senhaSalva.startsWith("$2b$") || 
            senhaSalva.startsWith("$2y$")) {
            return passwordEncoder.matches(senha, senhaSalva);
        }
        
        // Fallback para comparação simples (dados antigos sem hash)
        return senhaSalva.equals(senha);
    }).orElse(false);
}
```

**Lógica:**
1. Busca usuário por email
2. Compara senha fornecida com senha salva
3. Suporta tanto BCrypt quanto plaintext (compatibilidade)

**Retorno:**
- `true` se credenciais válidas
- `false` se inválidas ou usuário não existe

---

#### 4. **emailJaCadastrado(String email)**
Verifica se um email já existe no sistema.

```java
public boolean emailJaCadastrado(String email) {
    return usuarioRepository.existsByEmail(email);
}
```

**Retorno:**
- `true` se existe
- `false` se disponível

---

#### 5. **raJaCadastrado(String ra)**
Verifica se um RA já existe no sistema.

```java
public boolean raJaCadastrado(String ra) {
    return usuarioRepository.existsByRa(ra);
}
```

---

#### 6. **excluirUsuario(Integer id)**
Desativa (soft delete) um usuário.

```java
public void excluirUsuario(Integer id) {
    Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
    if (usuarioOpt.isPresent()) {
        Usuario usuario = usuarioOpt.get();
        usuario.setAtivado(false);  // Soft delete
        usuarioRepository.save(usuario);
        logger.info("Usuário desativado com sucesso! ID: {}", id);
    }
}
```

**Nota:** Soft delete significa que o registro permanece no BD mas fica marcado como inativo.

---

## 📦 ProdutoService

**Arquivo:** `ProdutoService.java`

**Descrição:** Gerencia operações com produtos.

### Métodos Principais

#### 1. **criarProduto(Produto produto)**
Cria um novo produto.

**Lógica:**
1. Valida dados usando ProdutoValidator
2. Verifica estoque (não pode ser negativo)
3. Define status como "ATIVO"
4. Define categoria se fornecida
5. Salva no banco

```java
public Produto criarProduto(Produto produto) {
    produtoValidator.validarProduto(produto);
    
    if (produto.getEstoque() < 0) {
        throw new IllegalArgumentException("Estoque não pode ser negativo");
    }
    
    produto.setStatus("ATIVO");
    return produtoRepository.save(produto);
}
```

---

#### 2. **buscarPorId(Integer id)**
Busca um produto pelo ID.

```java
public Optional<Produto> buscarPorId(Integer id) {
    return produtoRepository.findById(id);
}
```

---

#### 3. **listarPorCategoria(Integer idCategoria)**
Lista todos os produtos de uma categoria.

```java
public List<Produto> listarPorCategoria(Integer idCategoria) {
    return produtoRepository.findByCategoria_IdCategoria(idCategoria);
}
```

---

#### 4. **listarPorUsuario(Integer idUsuario)**
Lista produtos criados por um usuário específico.

```java
public List<Produto> listarPorUsuario(Integer idUsuario) {
    return produtoRepository.findByUsuario_Id(idUsuario);
}
```

---

#### 5. **atualizarEstoque(Integer idProduto, Integer novaQuantidade)**
Atualiza a quantidade em estoque.

```java
public void atualizarEstoque(Integer idProduto, Integer novaQuantidade) {
    Optional<Produto> produtoOpt = produtoRepository.findById(idProduto);
    
    if (produtoOpt.isPresent()) {
        Produto produto = produtoOpt.get();
        
        if (novaQuantidade < 0) {
            throw new IllegalArgumentException("Estoque não pode ser negativo");
        }
        
        // Se estoque ficou zero, desativa produto
        if (novaQuantidade == 0) {
            produto.setStatus("INATIVO");
        }
        
        produto.setEstoque(novaQuantidade);
        produtoRepository.save(produto);
    }
}
```

---

#### 6. **buscar(String termo)**
Busca produtos por nome ou descrição.

```java
public List<Produto> buscar(String termo) {
    return produtoRepository.findByNomeProdutoContainsIgnoreCaseOrDescricaoContainsIgnoreCase(
        termo, termo
    );
}
```

---

## 🛒 CarrinhoService

**Arquivo:** `CarrinhoService.java`

**Descrição:** Gerencia operações do carrinho de compras.

### Métodos Principais

#### 1. **obterCarrinho(Usuario usuario)**
Obtém ou cria o carrinho do usuário.

```java
public Carrinho obterCarrinho(Usuario usuario) {
    Optional<Carrinho> carrinhoOpt = carrinhoRepository.findByUsuario(usuario);
    
    if (carrinhoOpt.isPresent()) {
        return carrinhoOpt.get();
    }
    
    // Criar novo carrinho se não existir
    Carrinho novoCarrinho = new Carrinho();
    novoCarrinho.setUsuario(usuario);
    novoCarrinho.setDataCriacao(LocalDate.now());
    novoCarrinho.setItens(new ArrayList<>());
    
    return carrinhoRepository.save(novoCarrinho);
}
```

---

#### 2. **adicionarProduto(Carrinho carrinho, Produto produto, Integer quantidade)**
Adiciona um produto ao carrinho.

```java
public void adicionarProduto(Carrinho carrinho, Produto produto, Integer quantidade) {
    // Validações
    if (quantidade <= 0) {
        throw new IllegalArgumentException("Quantidade deve ser maior que zero");
    }
    
    if (produto.getEstoque() < quantidade) {
        throw new IllegalArgumentException("Estoque insuficiente");
    }
    
    // Verifica se produto já está no carrinho
    CarrinhoItem itemExistente = carrinho.getItens().stream()
        .filter(item -> item.getProduto().getIdProduto().equals(produto.getIdProduto()))
        .findFirst()
        .orElse(null);
    
    if (itemExistente != null) {
        // Aumenta quantidade do item existente
        itemExistente.setQuantidade(itemExistente.getQuantidade() + quantidade);
    } else {
        // Cria novo item
        CarrinhoItem novoItem = new CarrinhoItem();
        novoItem.setCarrinho(carrinho);
        novoItem.setProduto(produto);
        novoItem.setQuantidade(quantidade);
        carrinho.getItens().add(novoItem);
    }
    
    carrinho.setDataAtualizacao(LocalDate.now());
    carrinhoRepository.save(carrinho);
}
```

---

#### 3. **removerProduto(Carrinho carrinho, Integer idProduto)**
Remove um produto do carrinho.

```java
public void removerProduto(Carrinho carrinho, Integer idProduto) {
    carrinho.getItens().removeIf(item -> 
        item.getProduto().getIdProduto().equals(idProduto)
    );
    
    carrinho.setDataAtualizacao(LocalDate.now());
    carrinhoRepository.save(carrinho);
}
```

---

#### 4. **calcularTotal(Carrinho carrinho)**
Calcula o valor total do carrinho.

```java
public Double calcularTotal(Carrinho carrinho) {
    return carrinho.getItens().stream()
        .mapToDouble(item -> item.getProduto().getPreco() * item.getQuantidade())
        .sum();
}
```

---

#### 5. **limpar(Carrinho carrinho)**
Esvazia o carrinho.

```java
public void limpar(Carrinho carrinho) {
    carrinho.getItens().clear();
    carrinho.setDataAtualizacao(LocalDate.now());
    carrinhoRepository.save(carrinho);
}
```

---

## 🔐 CustomUserDetailsService

**Arquivo:** `CustomUserDetailsService.java`

**Descrição:** Implementa `UserDetailsService` do Spring Security para autenticação.

### Métodos

#### 1. **loadUserByUsername(String email)**
Carrega dados do usuário para autenticação.

```java
@Override
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Usuario usuario = usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    
    return User.builder()
        .username(usuario.getEmail())
        .password(usuario.getSenha())
        .authorities(getAuthorities(usuario))
        .accountNonExpired(true)
        .accountNonLocked(usuario.getAtivado())
        .credentialsNonExpired(true)
        .enabled(usuario.getAtivado())
        .build();
}
```

**Lógica:**
1. Busca usuário por email
2. Cria objeto UserDetails do Spring
3. Define authorities (permissões) com base no tipo de conta
4. Define se conta está habilitada

---

## 📊 Relação entre Services

```
AuthController
    ↓
    ├─> UsuarioService (salvar, autenticar)
    ├─> CustomUserDetailsService (loadUserByUsername)
    └─> JwtTokenProvider (generateToken)

ProdutoController
    ↓
    └─> ProdutoService (criar, buscar, atualizar)

CarrinhoController
    ↓
    ├─> CarrinhoService (adicionar, remover, calcular)
    └─> ProdutoService (buscar estoque)
```

---

## 🔄 Ciclo de Vida - Exemplo Completo

### Fluxo: Usuário faz login

```
1. AuthController.login(email, senha)
   └─> UsuarioService.autenticar(email, senha)
       └─> UsuarioRepository.findByEmail(email)
       └─> PasswordEncoder.matches(senha_fornecida, senha_salva)
       └─> Retorna true/false

2. Se autenticado:
   └─> CustomUserDetailsService.loadUserByUsername(email)
       └─> Cria UserDetails
   
3. JwtTokenProvider.generateToken(userDetails)
   └─> Cria token JWT

4. AuthController retorna:
   {
     "token": "eyJ...",
     "user": { id, email, nome }
   }
```

---

### Fluxo: Adicionar produto ao carrinho

```
1. CarrinhoController.adicionar(idProduto, quantidade)

2. CarrinhoService.obterCarrinho(usuarioAutenticado)
   └─> Busca ou cria carrinho

3. ProdutoService.buscarPorId(idProduto)
   └─> Valida produto e estoque

4. CarrinhoService.adicionarProduto(carrinho, produto, qtd)
   └─> Verifica estoque
   └─> Adiciona/atualiza item no carrinho
   └─> Salva carrinho

5. CarrinhoController retorna:
   {
     "idCarrinho": 1,
     "itens": [...],
     "precoTotal": 5000.00
   }
```

---

## ⚠️ Tratamento de Exceções

Services lançam exceções apropriadas:

```java
try {
    usuarioService.salvar(usuario);
} catch (RuntimeException e) {
    // Email ou RA duplicado
    return ResponseEntity.badRequest().body(e.getMessage());
} catch (Exception e) {
    // Erro inesperado
    logger.error("Erro ao salvar usuário", e);
    return ResponseEntity.status(500).body("Erro interno do servidor");
}
```

---

## 📝 Validações em Services

- **UsuarioValidator:** Valida email, CPF, data de nascimento
- **ProdutoValidator:** Valida nome, preço, estoque
- **Regras de Negócio:** Email único, RA único, estoque não-negativo

---

## 🎯 Próximos Passos

- Veja [04_REPOSITORIES.md](./04_REPOSITORIES.md) para acesso a dados
- Veja [05_SECURITY.md](./05_SECURITY.md) para segurança
- Veja [06_CONFIG.md](./06_CONFIG.md) para configurações
