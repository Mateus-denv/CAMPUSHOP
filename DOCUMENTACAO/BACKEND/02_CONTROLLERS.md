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
  "perfil": "CLIENTE"
}
```

**Validações:**
- Email deve ser único
- RA deve ser único
- Todos os campos obrigatórios devem ser preenchidos
- Email deve ter formato válido

**Retorno (Sucesso - 201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "nomeCompleto": "João Silva",
    "tipoConta": "CLIENTE"
  }
}
```

**Retorno (Erro - 400 Bad Request):**
```json
{
  "message": "Email já cadastrado" 
}
```

**Lógica Interna:**
1. Normaliza email (lowercase) e RA (trim)
2. Valida se email/RA já existem
3. Cria novo Usuario
4. Criptografa senha com BCrypt
5. Salva no BD
6. Gera JWT token
7. Retorna token + dados do usuário

---

#### 2. **POST /api/auth/login**
Autentica um usuário existente.

**Entrada (JSON):**
```json
{
  "email": "joao@example.com",
  "senha": "minhasenha123"
}
```

**Validações:**
- Email é obrigatório
- Senha é obrigatória
- Credenciais devem estar corretas

**Retorno (Sucesso - 200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "nomeCompleto": "João Silva",
    "tipoConta": "CLIENTE"
  }
}
```

**Retorno (Erro - 401 Unauthorized):**
```json
{
  "message": "Email ou senha inválidos"
}
```

**Lógica Interna:**
1. Valida campos obrigatórios
2. Busca usuário por email
3. Compara senha fornecida com senha criptografada
4. Se válido, gera JWT token
5. Retorna token + dados

---

#### 3. **GET /api/auth/me**
Retorna dados do usuário autenticado (requer token JWT).

**Headers Necessários:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Retorno (Sucesso - 200 OK):**
```json
{
  "id": 1,
  "email": "joao@example.com",
  "nomeCompleto": "João Silva",
  "tipoConta": "CLIENTE",
  "dataCadastro": "2026-04-17"
}
```

**Retorno (Erro - 401 Unauthorized):**
```json
{
  "message": "Token inválido ou expirado"
}
```

---

## 👤 UsuarioController

**Arquivo:** `UsuarioController.java`

**Rota Base:** `/api/usuarios`

**Descrição:** Gerencia informações de usuários.

### Métodos

#### 1. **GET /api/usuarios/{id}**
Retorna dados de um usuário específico.

**Parâmetros:**
- `id` (Path): ID do usuário

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
      "preco": 5000.00,
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
  "preco": 5000.00,
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
  "preco": 100.00,
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
  "preco": 100.00,
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
  "preco": 120.00,
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
  "preco": 120.00,
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
        "preco": 5000.00
      },
      "quantidade": 1,
      "precoTotal": 5000.00
    }
  ],
  "precoTotal": 5000.00
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

#### 3. **DELETE /api/carrinho/remover/{idProduto}**
Remove um produto do carrinho.

**Parâmetros:**
- `idProduto` (Path): ID do produto a remover

**Retorno (Sucesso - 200 OK):**
```json
{
  "idCarrinho": 1,
  "itens": [...],
  "precoTotal": 5000.00
}
```

---

#### 4. **POST /api/carrinho/limpar**
Esvazia o carrinho completamente.

**Retorno (Sucesso - 200 OK):**
```json
{
  "idCarrinho": 1,
  "itens": [],
  "precoTotal": 0.00
}
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

| Status | Significado | Exemplo |
|--------|-----------|---------|
| 200 | OK - Requisição bem-sucedida | Login realizado com sucesso |
| 201 | Created - Recurso criado | Produto cadastrado |
| 204 | No Content - Sucesso sem corpo | Produto deletado |
| 400 | Bad Request - Dados inválidos | Email duplicado |
| 401 | Unauthorized - Não autenticado | Token ausente/inválido |
| 403 | Forbidden - Sem permissão | Tentou atualizar produto de outro |
| 404 | Not Found - Recurso não existe | Produto com ID 999 não encontrado |
| 500 | Server Error - Erro interno | Erro de banco de dados |

---

## 📝 Anotações Spring Usadas

| Anotação | Descrição |
|----------|-----------|
| `@RestController` | Indica que a classe é um controlador REST |
| `@RequestMapping` | Define rota base do controlador |
| `@PostMapping` | HTTP POST |
| `@GetMapping` | HTTP GET |
| `@PutMapping` | HTTP PUT |
| `@DeleteMapping` | HTTP DELETE |
| `@PathVariable` | Extrai valor da URL |
| `@RequestBody` | Mapeia corpo JSON para objeto |
| `@RequestParam` | Parâmetro query da URL |
| `@Valid` | Valida objeto usando validators |

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
