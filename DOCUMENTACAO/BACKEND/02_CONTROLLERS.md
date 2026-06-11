# 🎮 Backend - Controladores REST (Controllers)

## 📋 Visão Geral

Os controladores (Controllers) são responsáveis por:

- Receber requisições HTTP
- Validar dados de entrada
- Chamar serviços para processar a lógica de negócio
- Retornar respostas JSON

**Localização:** `src/main/java/br/com/campushop/campushop_backend/controller/`

**Anotação Principal:** `@RestController` indica que cada método retorna JSON, não HTML

---

## 🔐 AuthController

**Arquivo:** `AuthController.java`

**Rota Base:** `/api/auth`

**Descrição:** Gerencia autenticação e registro de usuários.

### Métodos

#### 1. **POST /api/auth/register**

Registra um novo usuário na plataforma.

**Entrada (JSON):**

```json
{
  "nomeCompleto": "João Silva",
  "email": "joao@example.com",
  "ra": "2022001234",
  "senha": "minhasenha123",
  "cpfCnpj": "12345678900",
  "dataNascimento": "2000-05-15",
  "instituicao": "UFABC",
  "cidade": "Santo André",

#### 1. **GET /api/produtos**

Lista todos os produtos (retorno padronizado para o frontend).

**Query Parameters (opcional):** `categoria`, `pagina`, `tamanho`, `busca`

**Retorno (Sucesso - 200 OK):** lista de objetos no formato `ProdutoResponse` (veja abaixo).

---

#### 1.1 **GET /api/produtos/usuario**

Lista os produtos do usuário autenticado (mesmo formato de `GET /api/produtos`).

---

#### 2. **GET /api/produtos/{id}**

Retorna detalhes de um produto específico no formato `ProdutoResponse`.

**Parâmetros:** `id` (Path)

**Observação:** Exposição de dados depende da autenticação — o dono pode ver campos adicionais; compradores só veem produtos visíveis.

---

#### 3. **POST /api/produtos**

Cria um novo produto. Requer autenticação. Validações do servidor garantem campos obrigatórios (nome, descrição, categoria, preço>0, estoque>=0).

**Entrada (JSON):** objeto `Produto` simplificado com campos essenciais (`nomeProduto`, `descricao`, `preco`, `estoque`, `categoria`)

**Retorno (Sucesso - 201 Created):** objeto `Produto` salvo (com `idProduto`).

---

#### 4. **PUT /api/produtos/{id}**

Atualiza um produto existente. Apenas o criador pode atualizar.

**Entrada (JSON):** campos do produto a serem atualizados.

**Retorno (Sucesso - 200 OK):** objeto `Produto` atualizado.

---

#### 5. **Imagens do Produto**

Endpoints para upload, listagem e recuperação de imagens associadas a um produto:

- `POST /api/produtos/{id}/imagens` — upload de múltiplas imagens (multipart/form-data, campo `imagens`)
- `GET /api/produtos/{id}/imagens` — lista metadados das imagens
- `GET /api/produtos/{id}/imagens/principal` — obtém a imagem principal (bytes)
- `GET /api/produtos/{id}/imagens/{imagemId}` — obtém imagem específica (bytes)
- `DELETE /api/produtos/{id}/imagens/{imagemId}` — exclui imagem (apenas proprietário)

**Retornos:** metadados JSON para listagem; endpoints de imagem retornam bytes com `Content-Type` apropriado.

---

#### 6. **Status e Visibilidade**

- `PUT /api/produtos/{id}/status` — atualiza `status` do produto (ex.: `ATIVO`, `INATIVO`)
- `PUT /api/produtos/{id}/visibilidade` — atualiza campo `visivelParaComprador` (boolean)

**Retorno (Sucesso - 200 OK):** `ProdutoResponse` atualizado.

---

#### 7. **Flags de inatividade / estoque**

- `DELETE /api/produtos/{id}/inativo` — marca produto como inativo (soft)
- `DELETE /api/produtos/{id}/fora-estoque` — marca produto como fora de estoque

Ambos retornam `204 No Content` em sucesso.

---

#### 8. **DELETE /api/produtos/{id}` (hard delete)

Remove permanentemente o produto (requer permissões do proprietário/admin). Retorna `204 No Content`.

---

#### Formato `ProdutoResponse` (resumo)

O controller expõe um DTO `ProdutoResponse` que contém, entre outros, os campos:

- `idProduto`, `nomeProduto`, `descricao`, `estoque`, `preco`, `status`
- `visivelParaComprador` (boolean)
- `vendedor_id`, `nomeVendedor`
- `categoriaId`, `categoriaNome`

Esse formato é usado nas listagens e visualização para manter payload estável ao frontend.

**Retorno (Sucesso - 200 OK):**

```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "email": "joao@example.com",
  "ra": "2022001234",
  "cidade": "Santo André",
  "telefone": "11999999999",
  "instituicaoEnsino": "UFABC"
}
```

**Retorno (Erro - 404 Not Found):**

```json
{
  "message": "Usuário não encontrado"
}
```

---

#### 2. **PUT /api/usuarios/{id}**

Atualiza dados de um usuário (requer autenticação).

**Entrada (JSON):**

```json
{
  "nomeCompleto": "João Silva Atualizado",
  "telefone": "11988888888",
  "cidade": "São Paulo"
}
```

**Validações:**

- Usuário deve estar autenticado
- Apenas o próprio usuário pode atualizar seus dados (ou admin)

**Retorno (Sucesso - 200 OK):**

```json
{
  "id": 1,
  "nomeCompleto": "João Silva Atualizado",
  "email": "joao@example.com",
  "telefone": "11988888888"
}
```

---

#### 3. **DELETE /api/usuarios/{id}**

Desativa um usuário (soft delete - apenas marca como inativo).

**Parâmetros:**

- `id` (Path): ID do usuário

**Validações:**

- Usuário deve estar autenticado
- Apenas o próprio usuário pode deletar sua conta

**Retorno (Sucesso - 204 No Content):**

```
[Sem corpo na resposta]
```

---

## 📦 ProdutoController

**Arquivo:** `ProdutoController.java`

**Rota Base:** `/api/produtos`

**Descrição:** Gerencia produtos disponíveis para venda.

### Métodos

#### 1. **GET /api/produtos**

Lista todos os produtos (com paginação opcional).

**Query Parameters:**

```
?categoria=1&pagina=0&tamanho=10&busca=notebook
```

**Retorno (Sucesso - 200 OK):**

```json
{
  "conteudo": [
    {
      "idProduto": 1,
      "nomeProduto": "Notebook Gamer",
      "descricao": "Notebook com RTX 4090",
      "preco": 5000.0,
      "estoque": 10,
      "status": "ATIVO",
      "categoria": {
        "idCategoria": 1,
        "nomeCategoria": "Eletrônicos"
      }
    }
  ],
  "total": 50,
  "pagina": 0,
  "tamanho": 10
}
```

---

#### 2. **GET /api/produtos/{id}**

Retorna detalhes de um produto específico.

**Parâmetros:**

- `id` (Path): ID do produto

**Retorno (Sucesso - 200 OK):**

```json
{
  "idProduto": 1,
  "nomeProduto": "Notebook Gamer",
  "descricao": "Notebook com RTX 4090",
  "preco": 5000.0,
  "estoque": 10,
  "peso": 2.5,
  "dimensoes": "35x25x2cm",
  "status": "ATIVO",
  "categoria": {
    "idCategoria": 1,
    "nomeCategoria": "Eletrônicos"
  },
  "usuario": {
    "id": 1,
    "nomeCliente": "Loja XYZ"
  }
}
```

---

#### 3. **POST /api/produtos**

Cria um novo produto (requer autenticação e ser vendedor).

**Entrada (JSON):**

```json
{
  "nomeProduto": "Novo Produto",
  "descricao": "Descrição do produto",
  "preco": 100.0,
  "estoque": 20,
  "idCategoria": 1,
  "peso": 1.5,
  "dimensoes": "10x10x10cm"
}
```

**Validações:**

- Usuário deve estar autenticado
- Usuário deve ser vendedor (tipoConta == "VENDEDOR")
- Preço deve ser positivo
- Estoque deve ser >= 0
- Categoria deve existir

**Retorno (Sucesso - 201 Created):**

```json
{
  "idProduto": 101,
  "nomeProduto": "Novo Produto",
  "preco": 100.0,
  "estoque": 20,
  "status": "ATIVO"
}
```

---

#### 4. **PUT /api/produtos/{id}**

Atualiza um produto existente.

**Entrada (JSON):**

```json
{
  "nomeProduto": "Produto Atualizado",
  "preco": 120.0,
  "estoque": 15
}
```

**Validações:**

- Apenas o criador do produto pode atualizar
- Dados devem ser válidos

**Retorno (Sucesso - 200 OK):**

```json
{
  "idProduto": 1,
  "nomeProduto": "Produto Atualizado",
  "preco": 120.0,
  "estoque": 15
}
```

---

#### 5. **DELETE /api/produtos/{id}**

Deleta um produto.

**Validações:**

- Apenas o criador pode deletar
- Produto não pode estar em nenhum carrinho ativo

**Retorno (Sucesso - 204 No Content):**

```
[Sem corpo]
```

---

## 🛒 CarrinhoController

**Arquivo:** `CarrinhoController.java`

**Rota Base:** `/api/carrinho`

**Descrição:** Gerencia o carrinho de compras do usuário.

### Métodos

#### 1. **GET /api/carrinho**

Retorna o carrinho do usuário autenticado.

**Retorno (Sucesso - 200 OK):**

```json
{
  "idCarrinho": 1,
  "itens": [
    {
      "idItem": 1,
      "produto": {
        "idProduto": 1,
        "nomeProduto": "Notebook",
        "preco": 5000.0
      },
      "quantidade": 1,
      "precoTotal": 5000.0
    }
  ],
  "precoTotal": 5000.0
}
```

---

#### 2. **POST /api/carrinho/adicionar**

Adiciona um produto ao carrinho.

**Entrada (JSON):**

```json
{
  "idProduto": 1,
  "quantidade": 2
}
```

**Validações:**

- Produto deve existir
- Quantidade deve ser > 0
- Deve haver estoque suficiente
- Usuário deve estar autenticado

**Retorno (Sucesso - 200 OK):**

```json
{
  "idCarrinho": 1,
  "itens": [...],
  "precoTotal": 10000.00
}
```

---


#### 3. **DELETE /api/carrinho/{id}**

Remove um item do carrinho pelo ID do item (não pelo id do produto).

**Parâmetros:** `id` (Path) — ID do item do carrinho

**Retorno (Sucesso - 204 No Content):** sem corpo

---

#### 4. **PUT /api/carrinho/{id}**

Atualiza a quantidade de um item do carrinho.

**Entrada (JSON):**

```json
{ "quantidade": 3 }
```

**Retorno (Sucesso - 200 OK):** objeto `Carrinho` atualizado

---

#### 5. **DELETE /api/carrinho**

Esvazia o carrinho completamente (limpa todos os itens).

**Retorno (Sucesso - 204 No Content):** sem corpo

---

#### 6. **GET /api/carrinho/total**

Retorna o total do carrinho (soma dos preços) como JSON:

```json
{ "total": 1234.56 }
```

---

## 🏷️ CategoriaController

**Arquivo:** `CategoriaController.java`

**Rota Base:** `/api/categorias`

**Descrição:** Gerencia categorias de produtos.

### Métodos

#### 1. **GET /api/categorias**

Lista todas as categorias ativas.

**Retorno (Sucesso - 200 OK):**

```json
[
  {
    "idCategoria": 1,
    "nomeCategoria": "Eletrônicos",
    "descricao": "Produtos eletrônicos em geral",
    "ativa": true
  },
  {
    "idCategoria": 2,
    "nomeCategoria": "Livros",
    "descricao": "Livros acadêmicos e técnicos",
    "ativa": true
  }
]
```

---

#### 2. **GET /api/categorias/{id}**

Retorna uma categoria específica.

**Retorno (Sucesso - 200 OK):**

```json
{
  "idCategoria": 1,
  "nomeCategoria": "Eletrônicos",
  "descricao": "Produtos eletrônicos em geral",
  "ativa": true,
  "totalProdutos": 25
}
```

---

## 📋 PedidoController

**Arquivo:** `PedidoController.java`

**Rota Base:** `/api/pedidos`

**Descrição:** Gerencia pedidos de compra e histórico de transações.

### Métodos

#### 1. **POST /api/pedidos/confirmar**

Confirma os itens do carrinho como um novo pedido.

**Entrada (JSON):**

```json
{
  "vendedor_id": 2
}
```

**Validações:**

- Usuário deve estar autenticado
- Carrinho não pode estar vazio
- Todos os produtos devem ter estoque
- Cada item do carrinho vira um pedido separado

**Retorno (Sucesso - 201 Created):**

```json
{
  "pedidos": [
    {
      "idPedido": 50,
      "usuario": {
        "id": 1,
        "nomeCompleto": "João Comprador"
      },
      "vendedor": {
        "id": 2,
        "nomeCliente": "Loja ABC"
      },
      "statusPedido": "em analise",
      "valorPedido": 5000.00,
      "dataPedido": "2026-05-23T14:30:00",
      "itens": [
        {
          "idPedidoItem": 100,
          "produto": {
            "idProduto": 1,
            "nomeProduto": "Notebook"
          },
          "quantidade": 1,
          "precoUnitario": 5000.00
        }
      ]
    }
  ]
}
```

**Lógica Interna:**

1. Busca carrinho do usuário autenticado
2. Se carrinho está vazio, retorna erro
3. Para cada item do carrinho, cria um Pedido com o vendedor correspondente
4. Valida estoque de cada produto
5. Copia CarrinhoItems para PedidoItems
6. Limpa o carrinho
7. Retorna lista de pedidos criados

---

#### 2. **GET /api/pedidos/meus**

Retorna todos os pedidos do usuário (como comprador).

**Query Parameters:**

```
?status=em analise&pagina=0&tamanho=10
```

**Retorno (Sucesso - 200 OK):**

```json
{
  "conteudo": [
    {
      "idPedido": 50,
      "chaveEntrega": "A1B2C345",
      "statusPedido": "em analise",
      "valorPedido": 5000.00,
      "dataPedido": "2026-05-23T14:30:00",
      "vendedor": {
        "id": 2,
        "nomeCliente": "Loja ABC"
      },
      "itens": [...]
    }
  ],
  "total": 5,
  "pagina": 0,
  "tamanho": 10
}
```

---

#### 3. **GET /api/pedidos/recebidos**

Retorna pedidos que o usuário recebeufoi como vendedor.

**Query Parameters:**

```
?status=aceito&pagina=0&tamanho=10
```

**Retorno (Sucesso - 200 OK):**

```json
{
  "conteudo": [
    {
      "idPedido": 51,
      "chaveEntrega": "B2C3D456",
      "statusPedido": "aceito",
      "valorPedido": 2500.00,
      "dataPedido": "2026-05-22T10:15:00",
      "usuario": {
        "id": 3,
        "nomeCompleto": "Maria Comprador"
      },
      "itens": [...]
    }
  ],
  "total": 12,
  "pagina": 0,
  "tamanho": 10
}
```

---


#### 4. **PUT /api/pedidos/{id}/status**

Atualiza o status de um pedido (vendedor aceitando/rejeitando). Recebe um payload com o novo status.

**Entrada (JSON):**

```json
{
  "statusPedido": "aceito"
}
```

**Valores válidos para statusPedido:**

- `aceito` - Vendedor aceita a compra (gera chaveEntrega)
- `rejeitado` - Vendedor rejeita a compra
- `em analise` - Mantém em análise (não muda)
- `invalido` - Marca como inválido (erro)

**Validações:**

- Usuário deve estar autenticado
- Usuário deve ser o vendedor do pedido
- Status deve ser válido
- Pedido não pode estar já finalizado (aceito ou rejeitado por vendor)

**Retorno (Sucesso - 200 OK):**

```json
{
  "idPedido": 50,
  "statusPedido": "aceito",
  "chaveEntrega": "A1B2C345",
  "dataAtualizacao": "2026-05-23T15:00:00"
}
```

---

#### 5. **GET /api/pedidos/recebidos/pendentes/contagem**

Retorna a contagem de pedidos pendentes para o vendedor autenticado.

**Retorno (Sucesso - 200 OK):**

```json
{ "total": 3 }
```

**Retorno (Erro - 403 Forbidden):**

```json
{
  "message": "Você não é o vendedor deste pedido"
}
```

---

#### 5. **GET /api/pedidos/{id}**

Retorna detalhes de um pedido específico.

**Parâmetros:**

- `id` (Path): ID do pedido

**Retorno (Sucesso - 200 OK):**

```json
{
  "idPedido": 50,
  "usuario": {...},
  "vendedor": {...},
  "chaveEntrega": "A1B2C345",
  "statusPedido": "aceito",
  "valorPedido": 5000.00,
  "dataPedido": "2026-05-23T14:30:00",
  "dataAtualizacao": "2026-05-23T15:00:00",
  "itens": [
    {
      "idPedidoItem": 100,
      "produto": {...},
      "quantidade": 1,
      "precoUnitario": 5000.00,
      "subtotal": 5000.00
    }
  ]
}
```

---

## 🏠 HomeController

**Arquivo:** `HomeController.java`

**Rota Base:** `/`

**Descrição:** Controlador para páginas iniciais e healthcheck.

### Métodos

#### 1. **GET /**

Retorna status da aplicação.

**Retorno:**

```
Bem-vindo ao CampusShop API!
```

---

#### 2. **GET /health**

Health check da aplicação (monitoramento).

**Retorno (Sucesso - 200 OK):**

```json
{
  "status": "UP",
  "timestamp": "2026-04-17T10:30:00Z"
}
```

---

## 🛍️ CadastroController

**Arquivo:** `CadastroController.java`

**Descrição:** Gerencia funcionalidades de cadastro de produtos.

### Métodos (similar a ProdutoController)

- **POST /api/cadastro/produto** - Registro de novo produto
- **GET /api/cadastro/meus-produtos** - Lista produtos do usuário
- **PUT /api/cadastro/produto/{id}** - Atualiza produto próprio

---

## 🔐 Segurança nos Controllers

### Autenticação com JWT

Todos os endpoints que precisam de autenticação devem incluir o token no header:

```
Authorization: Bearer <token_jwt>
```

Exemplo em cURL:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:8080/api/auth/me
```

### Tratamento de Erros

| Status | Significado                    | Exemplo                           |
| ------ | ------------------------------ | --------------------------------- |
| 200    | OK - Requisição bem-sucedida   | Login realizado com sucesso       |
| 201    | Created - Recurso criado       | Produto cadastrado                |
| 204    | No Content - Sucesso sem corpo | Produto deletado                  |
| 400    | Bad Request - Dados inválidos  | Email duplicado                   |
| 401    | Unauthorized - Não autenticado | Token ausente/inválido            |
| 403    | Forbidden - Sem permissão      | Tentou atualizar produto de outro |
| 404    | Not Found - Recurso não existe | Produto com ID 999 não encontrado |
| 500    | Server Error - Erro interno    | Erro de banco de dados            |

---

## 📝 Anotações Spring Usadas

| Anotação          | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `@RestController` | Indica que a classe é um controlador REST |
| `@RequestMapping` | Define rota base do controlador           |
| `@PostMapping`    | HTTP POST                                 |
| `@GetMapping`     | HTTP GET                                  |
| `@PutMapping`     | HTTP PUT                                  |
| `@DeleteMapping`  | HTTP DELETE                               |
| `@PathVariable`   | Extrai valor da URL                       |
| `@RequestBody`    | Mapeia corpo JSON para objeto             |
| `@RequestParam`   | Parâmetro query da URL                    |
| `@Valid`          | Valida objeto usando validators           |

---

## 🎯 Fluxo de uma Requisição

```
1. Usuário/Cliente faz requisição HTTP
   └─> GET /api/produtos/1

2. Spring roteia para ProdutoController
   └─> @GetMapping("/{id}")

3. Controller injeta dependências
   └─> ProdutoService

4. Controller valida entrada
   └─> ID é válido?

5. Controller chama Service
   └─> produtoService.buscarPorId(1)

6. Service executa lógica de negócio
   └─> Busca no banco via Repository

7. Repository retorna dados
   └─> Produto encontrado

8. Service retorna ao Controller
   └─> Objeto Produto

9. Controller retorna Response JSON
   └─> 200 OK + JSON do Produto

10. Cliente/Frontend recebe resposta
    └─> Renderiza no navegador
```

---

## 🔗 Próximos Passos

- Veja [03_SERVICES.md](./03_SERVICES.md) para lógica de negócio
- Veja [04_REPOSITORIES.md](./04_REPOSITORIES.md) para acesso a dados
- Veja [05_SECURITY.md](./05_SECURITY.md) para segurança e JWT
