# 📝 Database - Queries Úteis

## 📋 Visão Geral

Coleção de queries SQL úteis para operações comuns no CampusShop.

---

## 👤 Queries de Usuario

### Buscar usuário por email

```sql
SELECT * FROM usuario WHERE email = 'joao@example.com';
```

### Listar usuários ativos

```sql
SELECT id, nomeCompleto, email, tipoConta
FROM usuario
WHERE ativado = true
ORDER BY dataCadastro DESC;
```

### Usuários inativos (que deletaram conta)

```sql
SELECT id, nomeCompleto, email
FROM usuario
WHERE ativado = false
ORDER BY dataAtualizacao DESC;
```

### Contar usuários por tipo

```sql
SELECT tipoConta, COUNT(*) as total
FROM usuario
WHERE ativado = true
GROUP BY tipoConta;
```

**Resultado esperado:**
```
tipoConta  | total
-----------|-------
CLIENTE    | 150
VENDEDOR   | 25
```

### Vendedores mais produtos

```sql
SELECT 
  u.nomeCompleto as vendedor,
  COUNT(p.idProduto) as totalProdutos,
  SUM(CASE WHEN p.status = 'ATIVO' THEN 1 ELSE 0 END) as produtosAtivos
FROM usuario u
  LEFT JOIN produto p ON u.id = p.idUsuario
WHERE u.tipoConta = 'VENDEDOR'
GROUP BY u.id
ORDER BY totalProdutos DESC
LIMIT 10;
```

---

## 📦 Queries de Produto

### Listar produtos de uma categoria

```sql
SELECT 
  p.idProduto,
  p.nomeProduto,
  p.preco,
  p.estoque,
  p.descricao
FROM produto p
WHERE p.idCategoria = 1
  AND p.status = 'ATIVO'
ORDER BY p.preco ASC;
```

### Produtos com baixo estoque (< 5 unidades)

```sql
SELECT 
  p.idProduto,
  p.nomeProduto,
  p.estoque,
  u.nomeCompleto as vendedor
FROM produto p
  JOIN usuario u ON p.idUsuario = u.id
WHERE p.estoque < 5
  AND p.status = 'ATIVO'
ORDER BY p.estoque ASC;
```

### Buscar produtos por nome (case-insensitive)

```sql
SELECT * FROM produto
WHERE LOWER(nomeProduto) LIKE LOWER('%notebook%')
   OR LOWER(descricao) LIKE LOWER('%notebook%')
ORDER BY preco DESC;
```

### Produtos ordenados por preço

```sql
-- Mais caros
SELECT * FROM produto
WHERE status = 'ATIVO'
ORDER BY preco DESC
LIMIT 20;

-- Mais baratos
SELECT * FROM produto
WHERE status = 'ATIVO'
ORDER BY preco ASC
LIMIT 20;
```

### Produtos por intervalo de preço

```sql
SELECT * FROM produto
WHERE preco BETWEEN 100 AND 500
  AND status = 'ATIVO'
ORDER BY preco;
```

### Produtos mais recentes

```sql
SELECT * FROM produto
WHERE status = 'ATIVO'
ORDER BY dataCadastro DESC
LIMIT 20;
```

### Contar produtos por categoria

```sql
SELECT 
  c.nomeCategoria,
  COUNT(p.idProduto) as total,
  SUM(CASE WHEN p.status = 'ATIVO' THEN 1 ELSE 0 END) as ativos
FROM categoria c
  LEFT JOIN produto p ON c.idCategoria = p.idCategoria
WHERE c.ativa = true
GROUP BY c.idCategoria
ORDER BY total DESC;
```

### Produtos sem categoria

```sql
SELECT * FROM produto
WHERE idCategoria IS NULL
  AND status = 'ATIVO';
```

### Produtos de um vendedor específico

```sql
SELECT p.*, c.nomeCategoria
FROM produto p
  LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
WHERE p.idUsuario = 5
ORDER BY p.dataCadastro DESC;
```

---

## 🛒 Queries de Carrinho

### Obter carrinho do usuário com itens

```sql
SELECT 
  c.idCarrinho,
  u.nomeCompleto,
  u.email,
  ci.idItem,
  p.nomeProduto,
  p.preco,
  ci.quantidade,
  (p.preco * ci.quantidade) as subtotal
FROM carrinho c
  JOIN usuario u ON c.idUsuario = u.id
  JOIN carrinhoItem ci ON c.idCarrinho = ci.idCarrinho
  JOIN produto p ON ci.idProduto = p.idProduto
WHERE c.idUsuario = 1
ORDER BY ci.idItem;
```

### Total do carrinho

```sql
SELECT 
  c.idCarrinho,
  SUM(p.preco * ci.quantidade) as total,
  COUNT(ci.idItem) as totalItens,
  SUM(ci.quantidade) as totalQuantidade
FROM carrinho c
  JOIN carrinhoItem ci ON c.idCarrinho = ci.idCarrinho
  JOIN produto p ON ci.idProduto = p.idProduto
WHERE c.idUsuario = 1
GROUP BY c.idCarrinho;
```

### Carrinhos inativos (sem atualização há muito tempo)

```sql
SELECT 
  c.idCarrinho,
  u.nomeCompleto,
  c.dataAtualizacao,
  DATEDIFF(NOW(), c.dataAtualizacao) as diasDesdeAtualizado,
  COUNT(ci.idItem) as totalItens
FROM carrinho c
  JOIN usuario u ON c.idUsuario = u.id
  LEFT JOIN carrinhoItem ci ON c.idCarrinho = ci.idCarrinho
WHERE c.dataAtualizacao < DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY c.idCarrinho
ORDER BY c.dataAtualizacao DESC;
```

### Verificar estoque antes de adicionar ao carrinho

```sql
-- Antes de adicionar produto 1 ao carrinho
SELECT 
  p.idProduto,
  p.nomeProduto,
  p.estoque,
  CASE 
    WHEN p.estoque > 0 THEN 'Disponível'
    ELSE 'Fora de estoque'
  END as statusEstoque
FROM produto p
WHERE p.idProduto = 1;
```

---

## 📋 Queries de Pedido

### Listar pedidos de um usuário

```sql
SELECT 
  p.idPedido,
  p.dataPedido,
  p.total,
  p.status,
  COUNT(pi.idItem) as totalItens
FROM pedido p
  LEFT JOIN pedidoItem pi ON p.idPedido = pi.idPedido
WHERE p.idUsuario = 1
GROUP BY p.idPedido
ORDER BY p.dataPedido DESC;
```

### Pedido com detalhes dos itens

```sql
SELECT 
  p.idPedido,
  p.dataPedido,
  p.total,
  p.status,
  pr.nomeProduto,
  pi.quantidade,
  pi.precoUnitario,
  pi.subtotal
FROM pedido p
  JOIN pedidoItem pi ON p.idPedido = pi.idPedido
  JOIN produto pr ON pi.idProduto = pr.idProduto
WHERE p.idPedido = 1
ORDER BY pi.idItem;
```

### Faturamento por período

```sql
SELECT 
  DATE(p.dataPedido) as data,
  COUNT(p.idPedido) as pedidos,
  SUM(p.total) as faturamento,
  AVG(p.total) as ticketMedio
FROM pedido p
WHERE p.dataPedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(p.dataPedido)
ORDER BY data DESC;
```

### Pedidos pendentes

```sql
SELECT 
  p.idPedido,
  u.nomeCompleto,
  u.email,
  p.dataPedido,
  p.total
FROM pedido p
  JOIN usuario u ON p.idUsuario = u.id
WHERE p.status = 'PENDENTE'
ORDER BY p.dataPedido ASC;
```

### Pedidos entregues este mês

```sql
SELECT 
  p.idPedido,
  u.nomeCompleto,
  p.dataPedido,
  p.total
FROM pedido p
  JOIN usuario u ON p.idUsuario = u.id
WHERE p.status = 'ENTREGUE'
  AND YEAR(p.dataPedido) = YEAR(NOW())
  AND MONTH(p.dataPedido) = MONTH(NOW())
ORDER BY p.dataPedido DESC;
```

### Top 10 clientes por gasto

```sql
SELECT 
  u.nomeCompleto,
  u.email,
  COUNT(p.idPedido) as totalPedidos,
  SUM(p.total) as totalGasto,
  AVG(p.total) as ticketMedio
FROM usuario u
  JOIN pedido p ON u.id = p.idUsuario
WHERE p.status IN ('ENTREGUE', 'ENVIADO')
GROUP BY u.id
ORDER BY totalGasto DESC
LIMIT 10;
```

### Produtos mais vendidos

```sql
SELECT 
  pr.nomeProduto,
  c.nomeCategoria,
  SUM(pi.quantidade) as totalVendido,
  SUM(pi.subtotal) as faturamento,
  AVG(pi.precoUnitario) as precoMedio
FROM pedidoItem pi
  JOIN produto pr ON pi.idProduto = pr.idProduto
  LEFT JOIN categoria c ON pr.idCategoria = c.idCategoria
GROUP BY pi.idProduto
ORDER BY totalVendido DESC
LIMIT 20;
```

---

## 📊 Queries de Relatório

### Dashboard - Estatísticas Gerais

```sql
SELECT 
  (SELECT COUNT(*) FROM usuario WHERE ativado = true) as totalUsuarios,
  (SELECT COUNT(*) FROM usuario WHERE tipoConta = 'VENDEDOR' AND ativado = true) as totalVendedores,
  (SELECT COUNT(*) FROM produto WHERE status = 'ATIVO') as produtosAtivos,
  (SELECT COUNT(*) FROM categoria WHERE ativa = true) as categoriasAtivas,
  (SELECT COUNT(*) FROM pedido WHERE status = 'PENDENTE') as pedidosPendentes,
  (SELECT SUM(total) FROM pedido WHERE MONTH(dataPedido) = MONTH(NOW())) as faturamentoMesAtual;
```

### Saúde do Sistema

```sql
-- Produtos com estoque zerado
SELECT COUNT(*) as produtosSemEstoque
FROM produto
WHERE estoque = 0
  AND status = 'ATIVO';

-- Carrinhos abandonados (sem atualização há 7 dias)
SELECT COUNT(*) as carrinhosAbandonados
FROM carrinho
WHERE dataAtualizacao < DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND EXISTS (
    SELECT 1 FROM carrinhoItem
    WHERE carrinhoItem.idCarrinho = carrinho.idCarrinho
  );

-- Usuários sem pedidos (possíveis churn)
SELECT COUNT(*) as usuariosSemCompra
FROM usuario
WHERE NOT EXISTS (
  SELECT 1 FROM pedido
  WHERE pedido.idUsuario = usuario.id
)
  AND dataCadastro < DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND ativado = true;
```

### Taxa de Conversão

```sql
SELECT 
  (SELECT COUNT(*) FROM usuario WHERE ativado = true) as usuariosRegistrados,
  (SELECT COUNT(DISTINCT idUsuario) FROM pedido) as usuariosQueCompraram,
  ROUND(
    (SELECT COUNT(DISTINCT idUsuario) FROM pedido) * 100.0 /
    (SELECT COUNT(*) FROM usuario WHERE ativado = true),
    2
  ) as taxaConversao;
```

---

## 🔍 Queries de Busca Avançada

### Busca Full-Text

```sql
-- Requer FULLTEXT index em produto(nomeProduto, descricao)
SELECT * FROM produto
WHERE MATCH(nomeProduto, descricao) AGAINST('notebook RTX' IN NATURAL LANGUAGE MODE)
  AND status = 'ATIVO'
ORDER BY RELEVANCE DESC;
```

### Busca com filtros múltiplos

```sql
SELECT * FROM produto
WHERE status = 'ATIVO'
  AND idCategoria IN (1, 2, 3)  -- Múltiplas categorias
  AND preco BETWEEN 100 AND 5000
  AND estoque > 0
  AND (
    LOWER(nomeProduto) LIKE LOWER('%notebook%')
    OR LOWER(descricao) LIKE LOWER('%notebook%')
  )
ORDER BY preco DESC
LIMIT 20
OFFSET 0;  -- Para paginação
```

---

## ⚡ Performance Tips

### Adicionar índices importantes

```sql
-- Índices de busca
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_ra ON usuario(ra);
CREATE INDEX idx_usuario_ativado ON usuario(ativado);

-- Índices de relacionamento
CREATE INDEX idx_produto_categoria ON produto(idCategoria);
CREATE INDEX idx_produto_usuario ON produto(idUsuario);
CREATE INDEX idx_carrinhoItem_carrinho ON carrinhoItem(idCarrinho);
CREATE INDEX idx_pedido_usuario ON pedido(idUsuario);
CREATE INDEX idx_pedido_data ON pedido(dataPedido);

-- Full-text search
CREATE FULLTEXT INDEX idx_produto_busca ON produto(nomeProduto, descricao);
```

### Executar EXPLAIN para análise

```sql
EXPLAIN SELECT * FROM produto
WHERE idCategoria = 1
  AND status = 'ATIVO'
ORDER BY preco;
```

Verificar se está usando índices (Type != ALL)

---

## 🎯 Próximos Passos

- Veja [01_SCHEMA.md](./01_SCHEMA.md) para estrutura
- Veja [02_RELATIONSHIPS.md](./02_RELATIONSHIPS.md) para fluxos
- Veja [../BACKEND/04_REPOSITORIES.md](../BACKEND/04_REPOSITORIES.md) para implementação em código
