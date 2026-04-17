# 📊 DATABASE - Documentação do Banco de Dados

Documentação completa sobre a estrutura e operações do banco de dados MySQL do CampusShop.

## 📑 Índice

### 1. [01_SCHEMA.md](./01_SCHEMA.md) - Estrutura das Tabelas

- **O que:** Definição de todas as 7 tabelas principais
- **Para quem:** DBAs, desenvolvedores backend, anyone querendo entender a estrutura
- **Conteúdo:**
  - Tabelas: usuario, categoria, produto, carrinho, carrinhoItem, pedido, pedidoItem
  - Atributos, tipos, restrições
  - Relacionamentos e foreign keys
  - Índices para performance
  - Scripts de inicialização (Flyway)

### 2. [02_RELATIONSHIPS.md](./02_RELATIONSHIPS.md) - Fluxo de Dados

- **O que:** Como as tabelas se relacionam e fluxo de operações
- **Para quem:** Desenvolvedores que querem entender a lógica de negócio
- **Conteúdo:**
  - Diagrama ER (Entity-Relationship)
  - Relacionamentos (1:1, 1:M)
  - Fluxo completo de compra (carrinho → pedido)
  - Estados possíveis
  - Cálculos importantes
  - Exemplo: João compra Notebook do João

### 3. [03_QUERIES.md](./03_QUERIES.md) - Exemplos de SQL

- **O que:** Queries prontas para usar
- **Para quem:** Desenvolvedores, DBAs, analytics
- **Conteúdo:**
  - Queries por tabela (usuario, produto, carrinho, pedido)
  - Relatórios e dashboards
  - Busca avançada
  - Performance tips
  - 50+ queries prontas para copiar-colar

---

## 🗂️ Estrutura Física

```
database/
  ├─ 001_schema.sql      (script de criação)
  ├─ 002_seed.sql        (dados iniciais)
  ├─ 003_validate.sql    (validação)
  └─ 999_rollback.sql    (rollback)
```

**Localização no projeto:** `db/scripts/`

---

## 🔑 Conceitos Principais

### Tabelas Principais

| Tabela       | Linhas | Propósito                    |
| ------------ | ------ | ---------------------------- |
| usuario      | ~200   | Usuários/clientes/vendedores |
| categoria    | ~20    | Categorias de produtos       |
| produto      | ~500   | Produtos à venda             |
| carrinho     | ~200   | 1 por usuário                |
| carrinhoItem | ~500   | Items no carrinho            |
| pedido       | ~300   | Pedidos finalizados          |
| pedidoItem   | ~900   | Items dos pedidos            |

### Relacionamentos Chave

```
Usuario (1) ──► Carrinho (1)
   │                │
   │ (1:M)          │ (1:M)
   │                │
   ├─► Produto      └─► CarrinhoItem ──► Produto
   │       │ (1:M)
   │       │
   └─► Pedido ──► PedidoItem ──► Produto
        (1:M)
```

---

## 🚀 Quick Start

### Criar banco de dados

```bash
# Docker (já incluído em docker-compose.yml)
docker-compose up mysql

# Ou manualmente
mysql -u root -p < db/scripts/001_schema.sql
mysql -u root -p < db/scripts/002_seed.sql
```

### Conectar ao banco

```bash
# Docker
docker exec -it campushop-mysql mysql -u campushop -p

# Localmente
mysql -h localhost -u campushop -p campushop
```

### Verificar estrutura

```sql
SHOW TABLES;
DESC usuario;
SHOW CREATE TABLE usuario;
```

---

## 🔗 Links Relacionados

- **Backend:** Veja [../BACKEND/](../BACKEND/) para implementação Java
- **Frontend:** Veja [../FRONTEND/](../FRONTEND/) para consumo de API
- **Models:** Veja [../BACKEND/01_MODELS.md](../BACKEND/01_MODELS.md) para entidades JPA
- **Repositories:** Veja [../BACKEND/04_REPOSITORIES.md](../BACKEND/04_REPOSITORIES.md) para acesso a dados
- **Controllers:** Veja [../BACKEND/02_CONTROLLERS.md](../BACKEND/02_CONTROLLERS.md) para endpoints REST

---

## 📊 Estatísticas (Exemplo)

```
Usuários registrados:     200
Vendedores ativos:        25
Produtos cadastrados:     500
Categorias:               20
Pedidos realizados:       300
Faturamento:              R$ 125.000
Taxa de conversão:        12.5%
Carrinho médio:           R$ 420
```

---

## 🎯 Próximos Passos

1. **Ler:** Comece com [01_SCHEMA.md](./01_SCHEMA.md) para entender estrutura
2. **Entender:** Leia [02_RELATIONSHIPS.md](./02_RELATIONSHIPS.md) para fluxo
3. **Usar:** Consulte [03_QUERIES.md](./03_QUERIES.md) para operações comuns
4. **Implementar:** Veja controllers em `BACKEND/02_CONTROLLERS.md`
