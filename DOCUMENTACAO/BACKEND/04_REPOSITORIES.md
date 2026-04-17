# 📊 Backend - Repositórios (Repositories)

## 📋 Visão Geral

Os repositórios (Repositories) gerenciam o acesso aos dados no banco de dados. Eles:

- Herdam de `JpaRepository` para operações CRUD básicas
- Definem queries customizadas
- Interagem diretamente com o banco de dados
- Retornam dados em forma de objetos Java

**Localização:** `src/main/java/br/com/campushop/campushop_backend/repository/`

**Padrão:** Cada Repository herda de `JpaRepository<Entidade, TipoDaPK>`

---

## 👤 UsuarioRepository

**Arquivo:** `UsuarioRepository.java`

**Descrição:** Acesso a dados de usuários.

```java
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    // Métodos customizados
}
```

### Métodos CRUD Herdados de JpaRepository

```java
// CREATE
save(Usuario usuario)               // Salva novo ou atualiza

// READ
findById(Integer id)                // Busca por ID
findAll()                           // Lista todos
findAll(Pageable)                   // Lista com paginação

// UPDATE
save(Usuario usuario)               // Atualiza

// DELETE
delete(Usuario usuario)             // Deleta
deleteById(Integer id)              // Deleta por ID
deleteAll()                         // Deleta tudo
```

### Métodos Customizados

#### 1. **findByEmail(String email)**

Busca usuário por email.

```java
Optional<Usuario> findByEmail(String email);
```

**SQL Gerado (aproximadamente):**

```sql
SELECT * FROM usuario WHERE email = ?
```

**Uso:**

```java
Optional<Usuario> usuario = usuarioRepository.findByEmail("joao@example.com");
```

---

#### 2. **existsByEmail(String email)**

Verifica se um email já existe.

```java
boolean existsByEmail(String email);
```

**SQL Gerado:**

```sql
SELECT COUNT(*) FROM usuario WHERE email = ?
```

---

#### 3. **findByRa(String ra)**

Busca usuário por RA.

```java
Optional<Usuario> findByRa(String ra);
```

---

#### 4. **existsByRa(String ra)**

Verifica se um RA já existe.

```java
boolean existsByRa(String ra);
```

---

#### 5. **findByAtivado(Boolean ativado)**

Lista usuários ativos ou inativos.

```java
List<Usuario> findByAtivado(Boolean ativado);
```

---

#### 6. **findByCidade(String cidade)**

Lista usuários de uma cidade.

```java
List<Usuario> findByCidade(String cidade);
```

---

## 📦 ProdutoRepository

**Arquivo:** `ProdutoRepository.java`

**Descrição:** Acesso a dados de produtos.

### Métodos Customizados

#### 1. **findByCategoria_IdCategoria(Integer idCategoria)**

Lista produtos de uma categoria.

```java
List<Produto> findByCategoria_IdCategoria(Integer idCategoria);
```

**SQL Gerado (aproximadamente):**

```sql
SELECT * FROM produto WHERE id_categoria = ?
```

---

#### 2. **findByUsuario_Id(Integer idUsuario)**

Lista produtos de um vendedor.

```java
List<Produto> findByUsuario_Id(Integer idUsuario);
```

---

#### 3. **findByStatus(String status)**

Lista produtos com um status específico.

```java
List<Produto> findByStatus(String status);
```

---

#### 4. **findByNomeProdutoContainsIgnoreCaseOrDescricaoContainsIgnoreCase**

Busca produtos por nome ou descrição (case-insensitive).

```java
List<Produto> findByNomeProdutoContainsIgnoreCaseOrDescricaoContainsIgnoreCase(
    String nome, String descricao
);
```

**SQL Gerado (aproximadamente):**

```sql
SELECT * FROM produto
WHERE LOWER(nome_produto) LIKE LOWER(CONCAT('%', ?, '%'))
   OR LOWER(descricao) LIKE LOWER(CONCAT('%', ?, '%'))
```

---

#### 5. **findByEstoqueGreaterThan(Integer quantidade)**

Lista produtos com estoque maior que uma quantidade.

```java
List<Produto> findByEstoqueGreaterThan(Integer quantidade);
```

---

#### 6. **findByPrecoLessThanEqual(Double preco)**

Lista produtos com preço menor ou igual a um valor.

```java
List<Produto> findByPrecoLessThanEqual(Double preco);
```

---

## 🏷️ CategoriaRepository

**Arquivo:** `CategoriaRepository.java`

**Descrição:** Acesso a dados de categorias.

### Métodos Customizados

#### 1. **findByNomeCategoriaIgnoreCase(String nome)**

Busca categoria por nome.

```java
Optional<Categoria> findByNomeCategoriaIgnoreCase(String nome);
```

---

#### 2. **findByAtiva(Boolean ativa)**

Lista categorias ativas ou inativas.

```java
List<Categoria> findByAtiva(Boolean ativa);
```

---

## 🛒 CarrinhoRepository

**Arquivo:** `CarrinhoRepository.java`

**Descrição:** Acesso a dados de carrinhos.

### Métodos Customizados

#### 1. **findByUsuario(Usuario usuario)**

Busca carrinho de um usuário.

```java
Optional<Carrinho> findByUsuario(Usuario usuario);
```

---

#### 2. **findByUsuario_Id(Integer idUsuario)**

Busca carrinho por ID do usuário.

```java
Optional<Carrinho> findByUsuario_Id(Integer idUsuario);
```

---

## 🔍 Convenção de Nomenclatura do Spring Data

Spring Data JPA interpreta nomes de métodos automaticamente:

| Palavra-chave | Significado      | SQL          |
| ------------- | ---------------- | ------------ |
| `find`        | SELECT           | WHERE        |
| `By`          | Onde (AND/OR)    | WHERE        |
| `And`         | E lógico         | AND          |
| `Or`          | Ou lógico        | OR           |
| `GreaterThan` | Maior que        | >            |
| `LessThan`    | Menor que        | <            |
| `Equals`      | Igual            | =            |
| `Contains`    | Contém           | LIKE '%...%' |
| `IgnoreCase`  | Case-insensitive | LOWER()      |

### Exemplos de Queries Derivadas

```java
// Simples
findByEmail(String email)
// SELECT * FROM usuario WHERE email = ?

// Múltiplas condições
findByEmailAndRa(String email, String ra)
// SELECT * FROM usuario WHERE email = ? AND ra = ?

// Comparações
findByEstoqueGreaterThan(Integer qtd)
// SELECT * FROM produto WHERE estoque > ?

findByPrecoLessThanEqual(Double preco)
// SELECT * FROM produto WHERE preco <= ?

// Case-insensitive
findByNomeProdutoContainsIgnoreCase(String nome)
// SELECT * FROM produto WHERE LOWER(nome_produto) LIKE LOWER('%?%')

// Or
findByNomeProdutoOrDescricao(String nome, String descricao)
// SELECT * FROM produto WHERE nome_produto = ? OR descricao = ?
```

---

## 📝 Queries Customizadas com @Query

Para queries mais complexas, pode-se usar `@Query`:

```java
@Query("SELECT p FROM Produto p WHERE p.estoque > 0 AND p.status = 'ATIVO'")
List<Produto> findProdutosDisoniveis();

@Query("SELECT COUNT(p) FROM Produto p WHERE p.usuario.id = ?1")
Integer countProdutosPorUsuario(Integer idUsuario);

@Query(value = "SELECT * FROM produto WHERE preco BETWEEN ?1 AND ?2",
       nativeQuery = true)
List<Produto> findProdutosPorIntervaloPreco(Double precoMin, Double precoMax);
```

---

## 🔄 Paginação e Ordenação

### Paginação

```java
Page<Produto> findByStatus(String status, Pageable pageable);

// Uso
Pageable pagina = PageRequest.of(0, 10);  // Página 0, 10 items
Page<Produto> resultado = produtoRepository.findByStatus("ATIVO", pagina);

resultado.getContent()      // Lista de produtos
resultado.getTotalElements() // Total de elementos
resultado.getTotalPages()    // Total de páginas
resultado.hasNext()          // Há próxima página?
```

### Ordenação

```java
// Com Sort
Pageable pagina = PageRequest.of(0, 10, Sort.by("preco").ascending());
Page<Produto> resultado = produtoRepository.findAll(pagina);

// Decrescente
Pageable pagina = PageRequest.of(0, 10, Sort.by("preco").descending());
```

---

## 🔐 Transações

Repositories funcionam dentro de transações automáticas do Spring:

```java
@Transactional
public void realizarCompra(Usuario usuario, List<Integer> idsProdutos) {
    // Todas as operações aqui são transacionais
    // Se houver erro, tudo é revertido (rollback)

    Carrinho carrinho = carrinhoRepository.findByUsuario(usuario).get();

    for (Integer idProduto : idsProdutos) {
        Produto produto = produtoRepository.findById(idProduto).get();
        carrinhoService.adicionarProduto(carrinho, produto, 1);
    }

    // Se houver erro aqui, tudo é desfeito
}
```

---

## 🛠️ Operações Comuns

### Buscar Um Registro

```java
// Por ID
Optional<Produto> produto = produtoRepository.findById(1);

// Garantido (lança exceção se não encontrado)
Produto produto = produtoRepository.findByIdOrElseThrow(() ->
    new ResourceNotFoundException("Produto não encontrado")
);
```

### Listar Registros

```java
// Todos
List<Produto> todos = produtoRepository.findAll();

// Com filtro
List<Produto> ativos = produtoRepository.findByStatus("ATIVO");

// Com paginação
Page<Produto> pagina = produtoRepository.findAll(PageRequest.of(0, 10));
```

### Contar Registros

```java
// Total de produtos
long total = produtoRepository.count();

// Ativos
long ativosCount = produtoRepository.countByStatus("ATIVO");
```

### Verificar Existência

```java
// Por ID
if (produtoRepository.existsById(1)) {
    // Existe
}

// Por atributo
if (usuarioRepository.existsByEmail("joao@example.com")) {
    // Email já cadastrado
}
```

### Deletar

```java
// Por ID
produtoRepository.deleteById(1);

// Específico
produtoRepository.delete(produto);

// Todos
produtoRepository.deleteAll();
```

---

## ⚠️ N+1 Query Problem

Quando há relacionamentos, pode ocorrer o problema N+1:

```java
// PROBLEMA - Faz N+1 queries (1 para listar + N para carregar cada usuário)
List<Produto> produtos = produtoRepository.findAll();
for (Produto p : produtos) {
    System.out.println(p.getUsuario().getNome());  // Query adicional!
}

// SOLUÇÃO - Usa JOIN FETCH para carregar tudo em uma query
@Query("SELECT p FROM Produto p LEFT JOIN FETCH p.usuario WHERE p.status = 'ATIVO'")
List<Produto> findProdutosComUsuario();
```

---

## 📚 Métodos JpaRepository

### Básicos

```java
S save(S entity);                   // Salva/atualiza
Iterable<S> saveAll(Iterable<S>);  // Salva múltiplos
Optional<T> findById(ID);           // Busca por ID
T getById(ID);                      // Busca garantido
boolean existsById(ID);             // Verifica existência
List<T> findAll();                  // Lista todos
Page<T> findAll(Pageable);          // Com paginação
long count();                       // Conta registros
void delete(T);                     // Deleta
void deleteById(ID);                // Deleta por ID
void deleteAll();                   // Deleta tudo
void flush();                       // Commit transação
```

---

## 🎯 Próximos Passos

- Veja [05_SECURITY.md](./05_SECURITY.md) para autenticação JWT
- Veja [02_CONTROLLERS.md](./02_CONTROLLERS.md) para ver como controllers usam repositories
- Veja [03_SERVICES.md](./03_SERVICES.md) para ver como services usam repositories
