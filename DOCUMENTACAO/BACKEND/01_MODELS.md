# 🔧 Backend - Modelos de Dados (Models)

## 📋 Visão Geral

Os modelos (Models) são as entidades JPA que representam as tabelas do banco de dados. Cada modelo é uma classe Java mapeada para uma tabela SQL através de anotações `@Entity` e `@Table`.

**Localização:** `src/main/java/br/com/campushop/campushop_backend/model/`

---

## 👤 Model: Usuario

**Arquivo:** `Usuario.java`

**Descrição:** Representa um usuário/cliente cadastrado na plataforma.

### Atributos Principais

| Atributo            | Tipo      | Restrições             | Descrição                                             |
| ------------------- | --------- | ---------------------- | ----------------------------------------------------- |
| `id`                | Integer   | PK, Auto-increment     | Identificador único do usuário                        |
| `nomeCompleto`      | String    | NOT NULL, len=100      | Nome completo do usuário                              |
| `ra`                | String    | NOT NULL, UNIQUE       | Registro acadêmico (matrícula)                        |
| `email`             | String    | NOT NULL, UNIQUE       | Email do usuário                                      |
| `senha`             | String    | NOT NULL, len=255      | Senha criptografada com BCrypt                        |
| `cpfCnpj`           | String    | len=20                 | CPF ou CNPJ                                           |
| `dataNascimento`    | LocalDate | -                      | Data de nascimento                                    |
| `cidade`            | String    | len=100                | Cidade onde o usuário mora                            |
| `nomeCliente`       | String    | NOT NULL, len=100      | Nome para ser exibido (pode ser igual a nomeCompleto) |
| `telefone`          | String    | len=15                 | Número de telefone                                    |
| `tipoConta`         | String    | len=20                 | Tipo de conta (CLIENTE, VENDEDOR, etc)                |
| `instituicaoEnsino` | String    | len=100                | Universidade/Faculdade                                |
| `localizacaoGps`    | String    | len=50                 | Coordenadas GPS (latitude, longitude)                 |
| `ativado`           | Boolean   | NOT NULL, default=true | Se a conta está ativa                                 |
| `dataCadastro`      | LocalDate | -                      | Data de registro na plataforma                        |

### Relacionamentos

- **1 para Muitos com Produto:** Um usuário pode criar vários produtos

  ```java
  @OneToMany(mappedBy = "usuario")
  private List<Produto> produtos;
  ```

- **1 para 1 com Carrinho:** Um usuário tem um carrinho de compras
  ```java
  @OneToOne(mappedBy = "usuario")
  private Carrinho carrinho;
  ```

### Métodos Importantes

```java
// Getters e Setters para todos os atributos
getId(), getNomeCompleto(), getEmail(), etc.
setSenha(), setAtivado(), etc.

// Métodos adicionais (se houver)
```

### Validações

- Email deve ser único
- RA deve ser único
- Email deve ser válido (validação customizada em UsuarioValidator)
- Data de nascimento deve ser válida
- CPF/CNPJ deve ser válido (validação customizada)

### Exemplo de Uso

```java
// Criar novo usuário
Usuario usuario = new Usuario();
usuario.setNomeCompleto("João Silva");
usuario.setEmail("joao@example.com");
usuario.setRa("2022001234");
usuario.setSenha("senha_criptografada");
usuario.setAtivado(true);
usuario.setTipoConta("CLIENTE");

// Será persistido no banco de dados
usuarioRepository.save(usuario);
```

---

## 📦 Model: Produto

**Arquivo:** `Produto.java`

**Descrição:** Representa um produto disponível para venda na plataforma.

### Atributos Principais

| Atributo      | Tipo      | Restrições         | Descrição                             |
| ------------- | --------- | ------------------ | ------------------------------------- |
| `idProduto`   | Integer   | PK, Auto-increment | Identificador único do produto        |
| `nomeProduto` | String    | NOT NULL, len=200  | Nome do produto                       |
| `descricao`   | String    | TEXT               | Descrição detalhada do produto        |
| `estoque`     | Integer   | NOT NULL           | Quantidade em estoque                 |
| `preco`       | Double    | NOT NULL           | Preço do produto                      |
| `status`      | String    | len=20             | Status (ATIVO, INATIVO, PAUSADO)      |
| `dimensoes`   | String    | -                  | Dimensões do produto (ex: 10x10x10cm) |
| `peso`        | Double    | -                  | Peso do produto em kg                 |
| `categoria`   | Categoria | FK                 | Categoria do produto                  |
| `usuario`     | Usuario   | FK                 | Usuário que criou/vende o produto     |

### Relacionamentos

- **Muitos para 1 com Categoria:**

  ```java
  @ManyToOne
  @JoinColumn(name = "id_categoria")
  private Categoria categoria;
  ```

- **Muitos para 1 com Usuario:**

  ```java
  @ManyToOne
  @JoinColumn(name = "id_usuario")
  private Usuario usuario;
  ```

- **Muitos para Muitos com Carrinho (através de CarrinhoItem):**
  Um produto pode estar em vários carrinhos

### Métodos Importantes

```java
getIdProduto()          // Retorna ID do produto
getNomeProduto()        // Retorna nome
getPreco()              // Retorna preço
getEstoque()            // Retorna quantidade em estoque
getCategoria()          // Retorna categoria do produto
getUsuario()            // Retorna vendedor do produto
setEstoque(int novo)    // Atualiza estoque
setStatus(String status)// Altera status
```

### Lógica de Negócio

- **Verificação de Estoque:** Ao adicionar ao carrinho, deve verificar se há estoque
- **Status do Produto:** Afeta se está visível para compra
- **Preço Dinâmico:** Pode variar conforme categoria ou promoções

### Exemplo de Uso

```java
// Criar novo produto
Produto produto = new Produto();
produto.setNomeProduto("Notebook Gamer");
produto.setDescricao("Notebook com RTX 4090");
produto.setPreco(5000.00);
produto.setEstoque(10);
produto.setStatus("ATIVO");
produto.setCategoria(categoriaEletronicos);
produto.setUsuario(vendedor);

produtoRepository.save(produto);
```

---

## 🏷️ Model: Categoria

**Arquivo:** `Categoria.java`

**Descrição:** Representa uma categoria de produtos.

### Atributos Principais

| Atributo        | Tipo    | Restrições         | Descrição                   |
| --------------- | ------- | ------------------ | --------------------------- |
| `idCategoria`   | Integer | PK, Auto-increment | Identificador único         |
| `nomeCategoria` | String  | NOT NULL, UNIQUE   | Nome da categoria           |
| `descricao`     | String  | -                  | Descrição da categoria      |
| `ativa`         | Boolean | default=true       | Se a categoria está visível |

### Relacionamentos

- **1 para Muitos com Produto:**
  ```java
  @OneToMany(mappedBy = "categoria")
  private List<Produto> produtos;
  ```

### Exemplos de Categorias

- Eletrônicos
- Livros
- Roupas
- Alimentos
- Serviços
- Móveis

### Exemplo de Uso

```java
Categoria categoria = new Categoria();
categoria.setNomeCategoria("Eletrônicos");
categoria.setDescricao("Produtos eletrônicos em geral");
categoria.setAtiva(true);

categoriaRepository.save(categoria);
```

---

## 🛒 Model: Carrinho

**Arquivo:** `Carrinho.java`

**Descrição:** Representa o carrinho de compras de um usuário.

### Atributos Principais

| Atributo          | Tipo                 | Restrições         | Descrição                        |
| ----------------- | -------------------- | ------------------ | -------------------------------- |
| `idCarrinho`      | Integer              | PK, Auto-increment | Identificador único              |
| `usuario`         | Usuario              | FK, NOT NULL       | Usuário proprietário do carrinho |
| `dataCriacao`     | LocalDate            | -                  | Data de criação do carrinho      |
| `dataAtualizacao` | LocalDate            | -                  | Última modificação               |
| `itens`           | List\<CarrinhoItem\> | -                  | Items adicionados ao carrinho    |

### Relacionamentos

- **1 para 1 com Usuario:**

  ```java
  @OneToOne
  @JoinColumn(name = "id_usuario")
  private Usuario usuario;
  ```

- **1 para Muitos com CarrinhoItem:**
  ```java
  @OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL)
  private List<CarrinhoItem> itens;
  ```

### Métodos Importantes

```java
getIdCarrinho()              // ID do carrinho
getUsuario()                 // Proprietário
getItens()                   // Items do carrinho
adicionarItem(CarrinhoItem)  // Adiciona item
removerItem(idItem)          // Remove item
calcularTotal()              // Soma preço de todos os items
limpar()                     // Esvazia o carrinho
```

### Exemplo de Uso

```java
// Ao fazer login, usuário obtém seu carrinho
Carrinho carrinho = carrinhoRepository.findByUsuario(usuario);

// Se não existir, criar novo
if (carrinho == null) {
    carrinho = new Carrinho();
    carrinho.setUsuario(usuario);
    carrinho.setDataCriacao(LocalDate.now());
    carrinhoRepository.save(carrinho);
}
```

---

## 📊 Relacionamentos Entre Models

```
Usuario (1) ──────────── (M) Produto
   │                        │
   │                        └─── (1) Categoria
   │
   └─── (1) Carrinho (1) ──── (M) CarrinhoItem (M) ── Produto (muitos para muitos)
        │
        └─── (1) Pedido (1) ──── (M) PedidoItem
```

### Fluxo de Dados no Carrinho

```
1. Usuário faz LOGIN
   └─> Carrega seu Carrinho

2. Usuário ADD PRODUTO
   └─> Cria CarrinhoItem
   └─> Desconta do estoque de Produto

3. Usuário REMOVE PRODUTO
   └─> Remove CarrinhoItem
   └─> Retorna estoque de Produto

4. Usuário CHECKOUT
   └─> Cria Pedido a partir do Carrinho
   └─> Copia CarrinhoItems para PedidoItems
   └─> Limpa Carrinho
   └─> Confirma estoque (final)
```

---

## ✅ Validações de Model

### Validações em Usuario

- **Email:** Deve ser único e ter formato válido
- **RA:** Deve ser único
- **CPF:** Deve ser válido (se preenchido)
- **Data de Nascimento:** Não pode ser data futura

### Validações em Produto

- **Preço:** Deve ser > 0
- **Estoque:** Não pode ser negativo
- **Nome:** Não pode estar vazio

### Validações em Categoria

- **Nome:** Deve ser único e não vazio

---

## 🔄 Ciclo de Vida dos Models

```
Model criado em memória
    ↓
Set de valores nos atributos
    ↓
Validações executadas (se houver)
    ↓
repository.save(model)  ← Persistência no BD
    ↓
Model agora tem ID gerado
    ↓
Pode ser atualizado ou deletado
```

---

## 📝 Anotações JPA Usadas

| Anotação             | Descrição                                                |
| -------------------- | -------------------------------------------------------- |
| `@Entity`            | Define a classe como entidade (mapeada a tabela)         |
| `@Table(name="...")` | Especifica nome da tabela no BD                          |
| `@Id`                | Define chave primária                                    |
| `@GeneratedValue`    | Auto-incremento de IDs                                   |
| `@Column`            | Define propriedades da coluna (nullable, unique, length) |
| `@ManyToOne`         | Relacionamento muitos para um                            |
| `@OneToMany`         | Relacionamento um para muitos                            |
| `@OneToOne`          | Relacionamento um para um                                |
| `@JoinColumn`        | Define coluna de junção (FK)                             |

---

## 🎯 Próximos Passos

- Veja [02_CONTROLLERS.md](./02_CONTROLLERS.md) para entender como esses models são usados
- Veja [03_SERVICES.md](./03_SERVICES.md) para lógica de negócio
- Veja [04_REPOSITORIES.md](./04_REPOSITORIES.md) para acesso a dados
