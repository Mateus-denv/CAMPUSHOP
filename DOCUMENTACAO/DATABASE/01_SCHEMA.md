# 📊 Database - Estrutura do Banco de Dados

## 📋 Visão Geral

O banco de dados do CampusShop é MySQL 8.0. Armazena todos os dados sobre usuários, produtos, categorias e pedidos.

**Localização do Schema:** `db/scripts/001_schema.sql`

**Banco de Dados:** `campushop`

---

## 📚 Tabelas Principais

### 1. usuario

**Descrição:** Armazena dados dos usuários (clientes e vendedores).

**Criação:**

```sql
CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomeCompleto VARCHAR(100) NOT NULL,
  ra VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cpfCnpj VARCHAR(20),
  dataNascimento DATE,
  cidade VARCHAR(100),
  nomeCliente VARCHAR(100),
  telefone VARCHAR(15),
  tipoConta VARCHAR(20),
  instituicaoEnsino VARCHAR(100),
  localizacaoGps VARCHAR(50),
  ativado BOOLEAN DEFAULT true,
  dataCadastro DATE,
  dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Atributos:**

| Campo               | Tipo         | Restrições         | Descrição                    |
| ------------------- | ------------ | ------------------ | ---------------------------- |
| `id`                | INT          | PK, AUTO_INCREMENT | Identificador único          |
| `nomeCompleto`      | VARCHAR(100) | NOT NULL           | Nome completo                |
| `ra`                | VARCHAR(50)  | NOT NULL, UNIQUE   | Registro acadêmico           |
| `email`             | VARCHAR(100) | NOT NULL, UNIQUE   | Email único                  |
| `senha`             | VARCHAR(255) | NOT NULL           | Senha criptografada (BCrypt) |
| `cpfCnpj`           | VARCHAR(20)  | -                  | CPF ou CNPJ                  |
| `dataNascimento`    | DATE         | -                  | Data de nascimento           |
| `cidade`            | VARCHAR(100) | -                  | Cidade                       |
| `nomeCliente`       | VARCHAR(100) | -                  | Nome para exibição           |
| `telefone`          | VARCHAR(15)  | -                  | Telefone                     |
| `tipoConta`         | VARCHAR(20)  | -                  | CLIENTE, VENDEDOR            |
| `instituicaoEnsino` | VARCHAR(100) | -                  | Universidade                 |
| `localizacaoGps`    | VARCHAR(50)  | -                  | Lat,Long                     |
| `ativado`           | BOOLEAN      | DEFAULT true       | Conta ativa                  |
| `dataCadastro`      | DATE         | -                  | Data de registro             |
| `dataAtualizacao`   | TIMESTAMP    | -                  | Última atualização           |

**Índices:**

- `INDEX idx_email` - Para buscas por email
- `INDEX idx_ra` - Para buscas por RA
- `INDEX idx_ativado` - Para filtrar usuários inativos

---

### 2. categoria

**Descrição:** Categorias de produtos.

**Criação:**

```sql
CREATE TABLE categoria (
  idCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nomeCategoria VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Atributos:**

| Campo             | Tipo         | Restrições         | Descrição          |
| ----------------- | ------------ | ------------------ | ------------------ |
| `idCategoria`     | INT          | PK, AUTO_INCREMENT | ID único           |
| `nomeCategoria`   | VARCHAR(100) | NOT NULL, UNIQUE   | Nome da categoria  |
| `descricao`       | TEXT         | -                  | Descrição          |
| `ativa`           | BOOLEAN      | DEFAULT true       | Visível ou não     |
| `dataAtualizacao` | TIMESTAMP    | -                  | Última atualização |

**Exemplos:**

- Eletrônicos
- Livros
- Roupas
- Alimentos
- Serviços

---

### 3. produto

**Descrição:** Produtos disponíveis para venda.

**Criação:**

```sql
CREATE TABLE produto (
  idProduto INT AUTO_INCREMENT PRIMARY KEY,
  nomeProduto VARCHAR(200) NOT NULL,
  descricao TEXT,
  estoque INT NOT NULL DEFAULT 0,
  preco DOUBLE NOT NULL,
  status VARCHAR(20),
  dimensoes VARCHAR(50),
  peso DOUBLE,
  idCategoria INT,
  idUsuario INT,
  dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (idCategoria) REFERENCES categoria(idCategoria),
  FOREIGN KEY (idUsuario) REFERENCES usuario(id)
);
```

**Atributos:**

| Campo             | Tipo         | Restrições         | Descrição               |
| ----------------- | ------------ | ------------------ | ----------------------- |
| `idProduto`       | INT          | PK, AUTO_INCREMENT | ID único                |
| `nomeProduto`     | VARCHAR(200) | NOT NULL           | Nome                    |
| `descricao`       | TEXT         | -                  | Descrição detalhada     |
| `estoque`         | INT          | NOT NULL, ≥ 0      | Quantidade em estoque   |
| `preco`           | DOUBLE       | NOT NULL, > 0      | Preço                   |
| `status`          | VARCHAR(20)  | -                  | ATIVO, INATIVO, PAUSADO |
| `dimensoes`       | VARCHAR(50)  | -                  | Ex: 10x10x10cm          |
| `peso`            | DOUBLE       | -                  | Em kg                   |
| `idCategoria`     | INT          | FK                 | Categoria do produto    |
| `idUsuario`       | INT          | FK                 | Vendedor/criador        |
| `dataCadastro`    | TIMESTAMP    | -                  | Data de criação         |
| `dataAtualizacao` | TIMESTAMP    | -                  | Última atualização      |

**Índices:**

- `INDEX idx_idCategoria` - Para buscar por categoria
- `INDEX idx_idUsuario` - Para buscar produtos de um vendedor
- `INDEX idx_status` - Para filtrar por status
- `FULLTEXT INDEX idx_busca` - Para busca em nome/descrição

---

### 4. carrinho

**Descrição:** Carrinho de compras de cada usuário.

**Criação:**

```sql
CREATE TABLE carrinho (
  idCarrinho INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL UNIQUE,
  dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (idUsuario) REFERENCES usuario(id) ON DELETE CASCADE
);
```

**Atributos:**

| Campo             | Tipo      | Restrições           | Descrição          |
| ----------------- | --------- | -------------------- | ------------------ |
| `idCarrinho`      | INT       | PK, AUTO_INCREMENT   | ID único           |
| `idUsuario`       | INT       | NOT NULL, UNIQUE, FK | Proprietário       |
| `dataCriacao`     | TIMESTAMP | -                    | Quando criou       |
| `dataAtualizacao` | TIMESTAMP | -                    | Última atualização |

**Nota:** Um usuário tem UM carrinho (1:1)

---

### 5. carrinhoItem

**Descrição:** Itens individuais dentro de um carrinho.

**Criação:**

```sql
CREATE TABLE carrinhoItem (
  idItem INT AUTO_INCREMENT PRIMARY KEY,
  idCarrinho INT NOT NULL,
  idProduto INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (idCarrinho) REFERENCES carrinho(idCarrinho) ON DELETE CASCADE,
  FOREIGN KEY (idProduto) REFERENCES produto(idProduto) ON DELETE CASCADE,
  UNIQUE KEY unique_carrinho_produto (idCarrinho, idProduto)
);
```

**Atributos:**

| Campo             | Tipo      | Restrições         | Descrição          |
| ----------------- | --------- | ------------------ | ------------------ |
| `idItem`          | INT       | PK, AUTO_INCREMENT | ID único           |
| `idCarrinho`      | INT       | NOT NULL, FK       | Qual carrinho      |
| `idProduto`       | INT       | NOT NULL, FK       | Qual produto       |
| `quantidade`      | INT       | NOT NULL, ≥ 1      | Quantidade         |
| `dataAtualizacao` | TIMESTAMP | -                  | Última atualização |

**Constraints:**

- `UNIQUE (idCarrinho, idProduto)` - Não pode ter o mesmo produto 2x no carrinho
- `ON DELETE CASCADE` - Se carrinho/produto deletado, item também é

**Nota:** Um carrinho pode ter MUITOS itens (1:M)

---

### 6. pedido

**Descrição:** Pedidos finalizados - registra transação entre comprador e vendedor.

**Criação:**

```sql
CREATE TABLE pedido (
  idPedido INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_vendedor INT NOT NULL,
  chaveEntrega VARCHAR(20) NOT NULL UNIQUE,
  statusPedido VARCHAR(20) NOT NULL DEFAULT 'em analise',
  valorPedido DOUBLE NOT NULL,
  dataPedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (id_vendedor) REFERENCES usuario(id) ON DELETE CASCADE,
  
  -- Validação de status
  CHECK (statusPedido IN ('em analise', 'aceito', 'rejeitado', 'invalido')),
  
  -- Validação de chave (formato: [A-Z][0-9][A-Z][0-9][A-Z][0-9]{3})
  CHECK (chaveEntrega REGEXP '^[A-Z][0-9][A-Z][0-9][A-Z][0-9]{3}$')
);
```

**Atributos:**

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `idPedido` | INT | PK, AUTO_INCREMENT | Identificador único |
| `id_usuario` | INT | NOT NULL, FK | Comprador (referencia usuario) |
| `id_vendedor` | INT | NOT NULL, FK | Vendedor (referencia usuario) |
| `chaveEntrega` | VARCHAR(20) | UNIQUE, CHECK REGEXP | Chave de acesso (ex: A1B2C345) |
| `statusPedido` | VARCHAR(20) | DEFAULT 'em analise' | Status: `em analise`, `aceito`, `rejeitado`, `invalido` |
| `valorPedido` | DOUBLE | NOT NULL | Valor total do pedido |
| `dataPedido` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Quando foi criado |
| `dataAtualizacao` | TIMESTAMP | - | Última modificação |

**Status Possíveis:**

- `em analise` - Pedido aguardando aprovação do vendedor
- `aceito` - Vendedor aceitou, chaveEntrega foi gerada
- `rejeitado` - Vendedor rejeitou a compra
- `invalido` - Pedido foi invalidado (erro de processamento)

**Exemplo de Chave Entrega:**

- `A1B2C345` (Letra, Número, Letra, Número, Letra, 3 Números)

**Índices:**

- `INDEX idx_pedido_usuario` - Para buscar pedidos do comprador
- `INDEX idx_pedido_vendedor` - Para buscar pedidos recebidos pelo vendedor
- `INDEX idx_pedido_status` - Para filtrar por status
- `UNIQUE idx_chaveEntrega` - Garante unicidade da chave

---

### 7. pedidoItem

**Descrição:** Items individuais dentro de um pedido - registra cada produto vendido.

**Criação:**

```sql
CREATE TABLE pedidoItem (
  idPedidoItem INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL,
  precoUnitario DOUBLE NOT NULL,
  dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (id_pedido) REFERENCES pedido(idPedido) ON DELETE CASCADE,
  FOREIGN KEY (id_produto) REFERENCES produto(idProduto) ON DELETE RESTRICT,
  
  -- Validações
  CHECK (quantidade > 0),
  CHECK (precoUnitario > 0)
);
```

**Atributos:**

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `idPedidoItem` | INT | PK, AUTO_INCREMENT | Identificador único do item |
| `id_pedido` | INT | NOT NULL, FK | Pedido ao qual pertence |
| `id_produto` | INT | NOT NULL, FK | Produto sendo vendido |
| `quantidade` | INT | NOT NULL, > 0 | Quantidade comprada |
| `precoUnitario` | DOUBLE | NOT NULL, > 0 | Preço unitário na época da compra |
| `dataCadastro` | TIMESTAMP | - | Quando o item foi adicionado ao pedido |

**Cálculos:**

```sql
-- Subtotal de um item
SELECT 
  pi.idPedidoItem,
  p.nomeProduto,
  pi.quantidade,
  pi.precoUnitario,
  (pi.quantidade * pi.precoUnitario) as subtotal
FROM pedidoItem pi
JOIN produto p ON pi.id_produto = p.idProduto
WHERE pi.id_pedido = 1;
```

**Nota:** `ON DELETE CASCADE` - Se pedido é deletado, itens também são. `ON DELETE RESTRICT` - Produto não pode ser deletado se estiver em pedidos.

**Índices:**

- `INDEX idx_pedidoItem_pedido` - Para buscar itens de um pedido
- `INDEX idx_pedidoItem_produto` - Para saber em quais pedidos um produto aparece

## 🔗 Relacionamentos

```
usuario (1)
  ├─── Como COMPRADOR (1) → (M) pedido
  │
  ├─── Como VENDEDOR (1) → (M) pedido
  │
  ├─── (1) → (1) carrinho
  │
  ├─── (1) → (M) produto (vendedor)
  │
  └─── (1) → (M) [carrinhoItem] (via carrinho)


categoria (1)
  └─── (1) → (M) produto


produto (1)
  ├─── (1) → (M) carrinhoItem
  │
  └─── (1) → (M) pedidoItem


carrinho (1)
  └─── (1) → (M) carrinhoItem


pedido (1)
  ├─── (M) → (1) usuario (comprador)
  │
  ├─── (M) → (1) usuario (vendedor)
  │
  └─── (1) → (M) pedidoItem
```

---

## 📊 Queries Úteis

### Listar todos os produtos de uma categoria

```sql
SELECT p.* FROM produto p
WHERE p.idCategoria = 1
  AND p.status = 'ATIVO'
ORDER BY p.dataCadastro DESC;
```

### Listar produtos de um vendedor

```sql
SELECT * FROM produto
WHERE idUsuario = 5
  AND status = 'ATIVO'
ORDER BY dataCadastro DESC;
```

### Buscar produtos por nome/descrição

```sql
SELECT * FROM produto
WHERE nomeProduto LIKE '%notebook%'
   OR descricao LIKE '%notebook%'
ORDER BY preco ASC;
```

### Obter itens do carrinho com detalhes

```sql
SELECT
  ci.idItem,
  p.idProduto,
  p.nomeProduto,
  p.preco,
  ci.quantidade,
  (p.preco * ci.quantidade) as subtotal
FROM carrinhoItem ci
  JOIN produto p ON ci.idProduto = p.idProduto
WHERE ci.idCarrinho = 1;
```

### Calcular total do carrinho

```sql
SELECT SUM(p.preco * ci.quantidade) as total
FROM carrinhoItem ci
  JOIN produto p ON ci.idProduto = p.idProduto
WHERE ci.idCarrinho = 1;
```

### Listar pedidos de um usuário

```sql
SELECT * FROM pedido
WHERE idUsuario = 1
ORDER BY dataPedido DESC;
```

### Listar itens de um pedido

```sql
SELECT pi.*, p.nomeProduto
FROM pedidoItem pi
  JOIN produto p ON pi.idProduto = p.idProduto
WHERE pi.idPedido = 1;
```

### Usuários mais ativos (mais compras)

```sql
SELECT
  u.nomeCompleto,
  COUNT(p.idPedido) as totalPedidos,
  SUM(p.total) as totalGasto
FROM usuario u
  LEFT JOIN pedido p ON u.id = p.idUsuario
GROUP BY u.id
ORDER BY totalGasto DESC
LIMIT 10;
```

### Produtos mais vendidos

```sql
SELECT
  p.nomeProduto,
  SUM(pi.quantidade) as totalVendido
FROM pedidoItem pi
  JOIN produto p ON pi.idProduto = p.idProduto
GROUP BY pi.idProduto
ORDER BY totalVendido DESC
LIMIT 10;
```

---

## 🔐 Constraints e Validações

### Uniqueness

- `email` em usuario (NOT NULL UNIQUE)
- `ra` em usuario (NOT NULL UNIQUE)
- `nomeCategoria` em categoria (NOT NULL UNIQUE)
- `chaveEntrega` em pedido (NOT NULL UNIQUE)
- `(idCarrinho, idProduto)` em carrinhoItem (UNIQUE)

### Foreign Keys (Integridade Referencial)

- `produto.idCategoria` → `categoria.idCategoria`
- `produto.idUsuario` → `usuario.id` (vendedor)
- `carrinho.idUsuario` → `usuario.id` (ON DELETE CASCADE)
- `carrinhoItem.idCarrinho` → `carrinho.idCarrinho` (ON DELETE CASCADE)
- `carrinhoItem.idProduto` → `produto.idProduto` (ON DELETE CASCADE)
- `pedido.id_usuario` → `usuario.id` (comprador, ON DELETE CASCADE)
- `pedido.id_vendedor` → `usuario.id` (vendedor, ON DELETE CASCADE)
- `pedidoItem.id_pedido` → `pedido.idPedido` (ON DELETE CASCADE)
- `pedidoItem.id_produto` → `produto.idProduto` (ON DELETE RESTRICT)

### Checks (Regras de Negócio)

**Produto:**
- `estoque >= 0`
- `preco > 0`
- `status IN ('ATIVO', 'INATIVO', 'PAUSADO')`

**Usuario:**
- `tipoConta IN ('CLIENTE', 'VENDEDOR')`
- `ativado IN (0, 1)`

**Pedido:**
- `statusPedido IN ('em analise', 'aceito', 'rejeitado', 'invalido')`
- `valorPedido > 0`
- `chaveEntrega REGEXP '^[A-Z][0-9][A-Z][0-9][A-Z][0-9]{3}$'` (ex: A1B2C345)

**PedidoItem:**
- `quantidade > 0`
- `precoUnitario > 0`

---

## 📈 Índices para Performance

```sql
-- Usuario
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_ra ON usuario(ra);
CREATE INDEX idx_usuario_ativado ON usuario(ativado);

-- Produto
CREATE INDEX idx_produto_categoria ON produto(idCategoria);
CREATE INDEX idx_produto_usuario ON produto(idUsuario);
CREATE INDEX idx_produto_status ON produto(status);
CREATE FULLTEXT INDEX idx_produto_busca ON produto(nomeProduto, descricao);

-- Carrinho/CarrinhoItem
CREATE INDEX idx_carrinho_usuario ON carrinho(idUsuario);
CREATE INDEX idx_carrinhoItem_carrinho ON carrinhoItem(idCarrinho);
CREATE INDEX idx_carrinhoItem_produto ON carrinhoItem(idProduto);

-- Pedido/PedidoItem
CREATE INDEX idx_pedido_usuario ON pedido(id_usuario);          -- Buscar por comprador
CREATE INDEX idx_pedido_vendedor ON pedido(id_vendedor);        -- Buscar por vendedor
CREATE INDEX idx_pedido_status ON pedido(statusPedido);         -- Filtrar por status
CREATE INDEX idx_pedido_chave ON pedido(chaveEntrega);          -- Buscar por chave
CREATE INDEX idx_pedido_data ON pedido(dataPedido);             -- Range queries por data
CREATE INDEX idx_pedidoItem_pedido ON pedidoItem(id_pedido);    -- Items de um pedido
CREATE INDEX idx_pedidoItem_produto ON pedidoItem(id_produto);  -- Pedidos com um produto
```

---

## 🚀 Scripts de Inicialização

**Arquivo:** `db/scripts/001_schema.sql`

Cria todas as tabelas com estrutura correta.

**Arquivo:** `db/scripts/002_seed.sql`

Popula com dados iniciais (categorias, usuários de teste).

**Arquivo:** `db/scripts/003_validate.sql`

Valida integridade dos dados.

---

## 🔄 Migrations e Versionamento

Com Hibernate `ddl-auto=update` em development:

- Tabelas são criadas automaticamente
- Colunas novas são adicionadas
- **Cuidado:** Deletar colunas não é automático (exige script manual)

Em production:

- Usar `ddl-auto=validate`
- Gerenciar migrations manualmente
- Usar Flyway ou Liquibase para versionamento

---

## 🎯 Próximos Passos

- Veja [01_MODELS.md](../BACKEND/01_MODELS.md) para mapear entidades Java
- Veja [04_REPOSITORIES.md](../BACKEND/04_REPOSITORIES.md) para queries
- Veja [05_SECURITY.md](../BACKEND/05_SECURITY.md) para dados de autenticação
