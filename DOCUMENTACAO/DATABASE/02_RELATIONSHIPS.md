# 🔗 Database - Relacionamentos e Fluxo de Dados

## 📊 Diagrama ER (Entity-Relationship)

```
┌─────────────┐                    ┌─────────────┐
│   Usuario   │                    │  Categoria  │
├─────────────┤                    ├─────────────┤
│ id (PK)     │◄──────1────────────│ idCategoria │
│ email       │        ├─ (M)      └─────────────┘
│ senha       │        │                    │
│ ra          │        │                    │ (1:M)
│ ...         │        │                    │
└─────────────┘        │              ┌─────▼──────┐
       │(1:M)          │              │  Produto   │
       │               │    ┌─────────│ idProduto  │
       │               │    │         └────────────┘
       │               │    │
       │(1:1) ┌────────┼────┴──────────────────┐
       │      │        │                       │
       │    ┌─▼──────────┐            ┌────────▼──┐
       ├───►│ Carrinho   │   (1:M)    │PedidoItem │
       │    │ idCarrinho │◄───────────│ idItem    │
       │    └────────────┘            └────────────┘
       │           │ (1:M)                  │
       │           │                        │ (M:1)
       │    ┌──────▼─────────┐      ┌───────▼────┐
       │    │ CarrinhoItem   │      │   Pedido   │
       │    │ idItem         │      │  idPedido  │
       │    └────────────────┘      └────┬───────┘
       │                                 │ (M:1)
       └─────────────────────────────────┘
```

---

## 1️⃣ Relacionamento: Usuario → Categoria → Produto

```
Usuario (1) ──► Categoria (M)
                    │
                    │ (1:M)
                    │
                Usuario que é VENDEDOR (1) ──► Produto (M)
                    │
                    └──► Define produtos para categoria
```

### Exemplo de Dados

```
Usuário: João Silva (id=1)
  └─ Criou Categoria: Eletrônicos (id=1)
      └─ Criou Produto: Notebook (id=1)
         └─ Preço: 5000.00
            └─ Estoque: 10
```

### Query para Obter

```sql
-- Todos os produtos do João em Eletrônicos
SELECT p.* FROM produto p
  JOIN categoria c ON p.idCategoria = c.idCategoria
WHERE p.idUsuario = 1 
  AND c.idCategoria = 1
  AND p.status = 'ATIVO';
```

---

## 🛒 Relacionamento: Usuario → Carrinho → CarrinhoItem → Produto

```
Usuario (1) ──────────► Carrinho (1)
  │                          │
  │                          │ (1:M)
  │                          │
  │                   ┌──────▼──────────┐
  │                   │  CarrinhoItem   │
  │                   │  (id_item, qtd) │
  │                   └────────┬────────┘
  │                            │ (M:1)
  │                            │
  │                            ◄── Produto
  │
  └──────────────────────────────► Pode comprar de múltiplos vendedores
```

### Exemplo de Dados

```
Usuário: João Silva (id=1)
  │
  └─ Carrinho (id=1)
      ├─ Item 1: Produto Notebook (id=1)
      │          Quantidade: 1
      │          Preço: 5000.00
      │          Subtotal: 5000.00
      │
      ├─ Item 2: Produto Mouse (id=2)
      │          Quantidade: 2
      │          Preço: 50.00
      │          Subtotal: 100.00
      │
      └─ Total do Carrinho: 5100.00
```

### Fluxo: Adicionar ao Carrinho

```
1. João vê Produto (Notebook, id=1)
   │
   └─ POST /api/carrinho/adicionar
      ├─ idProduto: 1
      ├─ quantidade: 1
   
2. Backend:
   ├─ Busca Carrinho de João (idUsuario=1)
   ├─ Verifica estoque: 10 >= 1 ✓
   ├─ Cria CarrinhoItem
   │  ├─ idCarrinho: 1
   │  ├─ idProduto: 1
   │  ├─ quantidade: 1
   └─ Salva
   
3. Response: 200 OK
   {
     idCarrinho: 1,
     itens: [
       {
         id: 1,
         produto: { id: 1, nome: "Notebook", ... },
         quantidade: 1
       }
     ]
   }
```

### Query para Obter Carrinho Completo

```sql
-- Carrinho do João com detalhes dos produtos
SELECT 
  c.idCarrinho,
  u.nomeCompleto as usuarioNome,
  ci.idItem,
  p.idProduto,
  p.nomeProduto,
  p.preco,
  ci.quantidade,
  (p.preco * ci.quantidade) as subtotal,
  SUM(p.preco * ci.quantidade) OVER () as carrinhoTotal
FROM carrinho c
  JOIN usuario u ON c.idUsuario = u.id
  JOIN carrinhoItem ci ON c.idCarrinho = ci.idCarrinho
  JOIN produto p ON ci.idProduto = p.idProduto
WHERE c.idUsuario = 1;
```

---

## 📦 Relacionamento: Carrinho → Pedido (Checkout)

```
Carrinho (1)
    │
    │ (Checkout)
    │
    ▼
Pedido (1) ──────────► PedidoItem (M)
    │                      │
    │                      │ (M:1)
    │                      │
    └─ Cópia de CarrinhoItem
       - Quantidade preservada
       - Preço congelado (não muda mais)
```

### Fluxo: Finalizar Compra

```
1. João acessa seu Carrinho
   └─ Tem 1x Notebook + 2x Mouse

2. Clica "Finalizar Compra"
   ├─ POST /api/pedidos/criar
   └─ Body: { carrinhoId: 1 }

3. Backend:
   ├─ Busca Carrinho (id=1)
   ├─ Verifica estoque NOVAMENTE
   │  ├─ Notebook: 1 <= 10 ✓
   │  ├─ Mouse: 2 <= 100 ✓
   │
   ├─ Cria Pedido
   │  ├─ idUsuario: 1
   │  ├─ total: 5100.00
   │  ├─ status: "PENDENTE"
   │
   ├─ Para cada CarrinhoItem:
   │  └─ Cria PedidoItem
   │     ├─ idPedido: (novo)
   │     ├─ idProduto: (mesmo)
   │     ├─ quantidade: (mesma)
   │     ├─ precoUnitario: (congelado)
   │
   ├─ Desconta Estoque
   │  ├─ Notebook: 10 - 1 = 9
   │  ├─ Mouse: 100 - 2 = 98
   │
   └─ Limpa Carrinho
      └─ DELETE FROM carrinhoItem WHERE idCarrinho=1

4. Response: 201 Created
   {
     idPedido: 1,
     dataPedido: "2026-04-17",
     total: 5100.00,
     status: "PENDENTE"
   }
```

### Query para Obter Pedido com Itens

```sql
-- Pedido completo com detalhes dos produtos
SELECT 
  p.idPedido,
  u.nomeCompleto,
  p.dataPedido,
  p.total,
  p.status,
  pi.idItem,
  pr.nomeProduto,
  pi.quantidade,
  pi.precoUnitario,
  pi.subtotal
FROM pedido p
  JOIN usuario u ON p.idUsuario = u.id
  JOIN pedidoItem pi ON p.idPedido = pi.idPedido
  JOIN produto pr ON pi.idProduto = pr.idProduto
WHERE p.idPedido = 1;
```

---

## 👥 Relacionamento: Múltiplos Vendedores

```
Vendedor 1 (Usuario)        Vendedor 2 (Usuario)
    │                            │
    │                            │
  Produto 1                    Produto 3
  Produto 2                    Produto 4
    │                            │
    └────────┬────────────────┬──┘
             │                │
          [Carrinho de João]
             │                │
      Item 1: Prod 1 (V1)  Item 2: Prod 3 (V2)
             │                │
          (Checkout)
             │
          [Pedido]
             │
       ├─ PedidoItem 1: Prod 1 (V1)
       ├─ PedidoItem 2: Prod 3 (V2)
       └─ João comprou de 2 vendedores diferentes!
```

### Query: Pedidos por Vendedor

```sql
-- Ver quem vendeu para João
SELECT DISTINCT
  v.nomeCompleto as vendedor,
  COUNT(pi.idItem) as totalItems,
  SUM(pi.subtotal) as total
FROM pedido p
  JOIN pedidoItem pi ON p.idPedido = pi.idPedido
  JOIN produto pr ON pi.idProduto = pr.idProduto
  JOIN usuario v ON pr.idUsuario = v.id
WHERE p.idUsuario = 1  -- Comprador: João
GROUP BY v.id
ORDER BY total DESC;
```

---

## 📈 Fluxo Completo de Compra

```
INICIO
  │
  ├─ 1. BROWSE
  │  ├─ GET /api/categorias
  │  ├─ GET /api/produtos
  │  └─ GET /api/produtos/:id
  │
  ├─ 2. ADICIONAR AO CARRINHO
  │  ├─ POST /api/carrinho/adicionar
  │  │  ├─ Busca Carrinho do Usuario
  │  │  ├─ Valida Estoque
  │  │  └─ Cria/Atualiza CarrinhoItem
  │  │
  │  ├─ GET /api/carrinho (visualizar)
  │  │
  │  └─ Pode remover ou alterar quantidade
  │
  ├─ 3. CHECKOUT
  │  ├─ POST /api/pedidos/criar
  │  │  ├─ Validação Final de Estoque
  │  │  ├─ Cria Pedido
  │  │  ├─ Cria PedidoItems
  │  │  ├─ Atualiza Estoque de Produtos
  │  │  └─ Limpa Carrinho
  │  │
  │  └─ Response: Pedido criado com sucesso
  │
  ├─ 4. CONFIRMAÇÃO
  │  ├─ GET /api/pedidos/:id (ver detalhes)
  │  └─ GET /api/pedidos (listar todos)
  │
  └─ FIM - PEDIDO REALIZADO
```

---

## 🔄 Estados Possíveis

### Estado do Carrinho

```
VAZIO
  └─ Usuário adiciona produto
     └─ COM_ITENS
        ├─ Usuário adiciona mais
        ├─ Usuário remove item
        │  └─ Volta a VAZIO?
        └─ Usuário finalize compra
           └─ CHECKOUT_EM_PROGRESSO
              └─ PEDIDO_CRIADO
                 └─ CARRINHO_LIMPO
```

### Estado do Pedido

```
PENDENTE
  └─ Administrador processa
     └─ ENVIADO
        └─ Entrega
           └─ ENTREGUE

(Exceção)
├─ CANCELADO (a qualquer momento)
└─ DEVOLVIDO
```

---

## 💰 Cálculos Importantes

### Total do Carrinho

```
Total = Σ (Produto.preço × CarrinhoItem.quantidade)

Exemplo:
- Notebook: 5000 × 1 = 5000
- Mouse: 50 × 2 = 100
- Total: 5100
```

### Desconto de Estoque

```
Novo Estoque = Estoque Atual - Quantidade Comprada

Exemplo:
- Notebook tinha 10
- João comprou 1
- Novo estoque: 10 - 1 = 9
```

### Relatório de Vendas por Período

```sql
SELECT 
  DATE(p.dataPedido) as data,
  COUNT(p.idPedido) as pedidos,
  SUM(p.total) as faturamento
FROM pedido p
WHERE p.dataPedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(p.dataPedido)
ORDER BY data DESC;
```

---

## 🎯 Próximos Passos

- Veja [01_SCHEMA.md](./01_SCHEMA.md) para estrutura das tabelas
- Veja [03_QUERIES.md](./03_QUERIES.md) para mais exemplos de queries
- Veja [../BACKEND/04_REPOSITORIES.md](../BACKEND/04_REPOSITORIES.md) para implementação em código
