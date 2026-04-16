# 🧪 GUIA COMPLETO DE TESTES - APIDOG

## ⚠️ INFORMAÇÃO IMPORTANTE

**ROTA ÚNICA PARA ANUNCIAR PRODUTOS:**
- ✅ **POST /api/produtos** - API REST (JSON) - ÚNICA ROTA VÁLIDA
- ❌ ~~POST /cadastrar-produto~~ - REMOVIDA (era MVC tradicional, conflitava com API)

O frontend React usa apenas **POST /api/produtos**. Todas as operações de produto agora usam esta rota API.

---

## 📋 ENDPOINTS COMPLETOS

### **🔐 AUTENTICAÇÃO**

#### **1. CADASTRO DE USUÁRIO**
```
POST http://localhost:8080/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nomeCompleto": "João Silva",
  "email": "joao@test.com",
  "ra": "123456789",
  "instituicao": "UFBA",
  "cidade": "Salvador",
  "perfil": "usuario",
  "cpfCnpj": "12345678901",
  "dataNascimento": "2005-11-16",
  "senha": "123456",
  "confirmarSenha": "123456"
}
```

**Resposta Esperada (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@test.com",
    "ra": "123456789"
  }
}
```

---

#### **2. LOGIN**
```
POST http://localhost:8080/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "joao@test.com",
  "senha": "123456"
}
```

**Resposta Esperada (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@test.com"
  }
}
```

---

#### **3. VERIFICAR USUÁRIO LOGADO**
```
GET http://localhost:8080/api/auth/me
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resposta Esperada (200):**
```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "email": "joao@test.com",
  "ra": "123456789",
  "instituicao": "UFBA",
  "cidade": "Salvador",
  "perfil": "usuario"
}
```

---

### **📂 CATEGORIAS**

#### **4. LISTAR TODAS AS CATEGORIAS**
```
GET http://localhost:8080/api/categorias
```

**Headers:**
```
Content-Type: application/json
```

**Resposta Esperada (200):**
```json
[
  {
    "idCategoria": 1,
    "nome_categoria": "Livros",
    "descricao": "Materiais de estudo e leitura"
  },
  {
    "idCategoria": 2,
    "nome_categoria": "Eletrônicos",
    "descricao": "Itens eletrônicos e acessórios"
  },
  {
    "idCategoria": 3,
    "nome_categoria": "Roupas",
    "descricao": "Roupas e acessórios em geral"
  }
]
```

---

#### **5. CRIAR CATEGORIA (ADMIN)**
```
POST http://localhost:8080/api/categorias
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Body (JSON):**
```json
{
  "nome_categoria": "Esportes",
  "descricao": "Equipamentos e artigos esportivos"
}
```

**Resposta Esperada (201):**
```json
{
  "idCategoria": 11,
  "nome_categoria": "Esportes",
  "descricao": "Equipamentos e artigos esportivos"
}
```

---

### **📦 PRODUTOS**

#### **6. LISTAR TODOS OS PRODUTOS**
```
GET http://localhost:8080/api/produtos
```

**Headers:**
```
Content-Type: application/json
```

**Resposta Esperada (200):**
```json
[
  {
    "idProduto": 1,
    "nomeProduto": "Livro de Programação",
    "descricao": "Livro Python 3.10 - Excelente estado",
    "estoque": 3,
    "preco": 49.90,
    "status": "ATIVO",
    "peso": 0.5,
    "dimensoes": "20x15x2 cm",
    "categoria": {
      "idCategoria": 1,
      "nome_categoria": "Livros"
    },
    "usuario": {
      "id": 1,
      "nomeCompleto": "João Silva",
      "email": "joao@test.com"
    }
  }
]
```

---

#### **7. BUSCAR PRODUTO POR ID**
```
GET http://localhost:8080/api/produtos/{id}
```

**Headers:**
```
Content-Type: application/json
```

**Exemplo:**
```
GET http://localhost:8080/api/produtos/1
```

**Resposta Esperada (200):**
```json
{
  "idProduto": 1,
  "nomeProduto": "Livro de Programação",
  "descricao": "Livro Python 3.10 - Excelente estado",
  "estoque": 3,
  "preco": 49.90,
  "status": "ATIVO",
  "peso": 0.5,
  "dimensoes": "20x15x2 cm",
  "categoria": {
    "idCategoria": 1,
    "nome_categoria": "Livros"
  },
  "usuario": {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@test.com"
  }
}
```

---

#### **8. LISTAR MEUS PRODUTOS (USUÁRIO LOGADO)**
```
GET http://localhost:8080/api/produtos/usuario
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resposta Esperada (200):**
```json
[
  {
    "idProduto": 1,
    "nomeProduto": "Livro de Programação",
    "descricao": "Livro Python 3.10 - Excelente estado",
    "estoque": 3,
    "preco": 49.90,
    "status": "ATIVO",
    "peso": 0.5,
    "dimensoes": "20x15x2 cm",
    "categoria": {
      "idCategoria": 1,
      "nome_categoria": "Livros"
    }
  },
  {
    "idProduto": 5,
    "nomeProduto": "Notebook Gamer",
    "descricao": "Notebook i7, 16GB RAM, RTX 3050",
    "estoque": 2,
    "preco": 3500.00,
    "status": "ATIVO",
    "peso": 1.8,
    "dimensoes": "35x25x2 cm",
    "categoria": {
      "idCategoria": 2,
      "nome_categoria": "Eletrônicos"
    }
  }
]
```

---

#### **9. CRIAR PRODUTO (USUÁRIO LOGADO)**
```
POST http://localhost:8080/api/produtos
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Body (JSON):**
```json
{
  "nomeProduto": "Livro de Programação",
  "descricao": "Livro Python 3.10 - Excelente estado",
  "estoque": 3,
  "preco": 49.90,
  "status": "ATIVO",
  "dimensoes": "20x15x2 cm",
  "peso": 0.5,
  "categoria": {
    "idCategoria": 1
  }
}
```

**Resposta Esperada (200):**
```json
{
  "idProduto": 123,
  "nomeProduto": "Livro de Programação",
  "descricao": "Livro Python 3.10 - Excelente estado",
  "estoque": 3,
  "preco": 49.90,
  "status": "ATIVO",
  "peso": 0.5,
  "dimensoes": "20x15x2 cm",
  "categoria": {
    "idCategoria": 1,
    "nome_categoria": "Livros"
  },
  "usuario": {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@test.com"
  }
}
```

---

#### **10. ATUALIZAR PRODUTO**
```
PUT http://localhost:8080/api/produtos/{id}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Exemplo:**
```
PUT http://localhost:8080/api/produtos/1
```

**Body (JSON):**
```json
{
  "nomeProduto": "Livro de Programação Python",
  "descricao": "Livro Python 3.10 - Edição completa",
  "estoque": 5,
  "preco": 59.90,
  "status": "ATIVO",
  "peso": 0.6,
  "dimensoes": "20x15x2.5 cm",
  "categoria": {
    "idCategoria": 1
  }
}
```

**Resposta Esperada (200):**
```json
{
  "idProduto": 1,
  "nomeProduto": "Livro de Programação Python",
  "descricao": "Livro Python 3.10 - Edição completa",
  "estoque": 5,
  "preco": 59.90,
  "status": "ATIVO",
  "peso": 0.6,
  "dimensoes": "20x15x2.5 cm",
  "categoria": {
    "idCategoria": 1,
    "nome_categoria": "Livros"
  },
  "usuario": {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@test.com"
  }
}
```

---

#### **11. MARCAR PRODUTO COMO INATIVO**
```
DELETE http://localhost:8080/api/produtos/{id}/inativo
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Exemplo:**
```
DELETE http://localhost:8080/api/produtos/1/inativo
```

**Resposta Esperada (204):** Sem conteúdo (No Content)

---

#### **12. MARCAR PRODUTO COMO FORA DE ESTOQUE**
```
DELETE http://localhost:8080/api/produtos/{id}/fora-estoque
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Exemplo:**
```
DELETE http://localhost:8080/api/produtos/1/fora-estoque
```

**Resposta Esperada (204):** Sem conteúdo (No Content)

---

#### **13. DELETAR PRODUTO (PERMANENTEMENTE)**
```
DELETE http://localhost:8080/api/produtos/{id}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Exemplo:**
```
DELETE http://localhost:8080/api/produtos/1
```

**Resposta Esperada (204):** Sem conteúdo (No Content)

---

### **🛒 CARRINHO**

#### **14. LISTAR ITENS DO CARRINHO (USUÁRIO LOGADO)**
```
GET http://localhost:8080/api/carrinho
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resposta Esperada (200):**
```json
[
  {
    "idCarrinho": 1,
    "usuario": {
      "id": 1,
      "email": "joao@test.com",
      "nomeCompleto": "João Silva"
    },
    "produto": {
      "idProduto": 1,
      "nomeProduto": "Livro de Programação",
      "preco": 49.90,
      "estoque": 3
    },
    "quantidade": 2,
    "subtotal": 99.80
  },
  {
    "idCarrinho": 2,
    "usuario": {
      "id": 1,
      "email": "joao@test.com",
      "nomeCompleto": "João Silva"
    },
    "produto": {
      "idProduto": 5,
      "nomeProduto": "Notebook Gamer",
      "preco": 3500.00,
      "estoque": 2
    },
    "quantidade": 1,
    "subtotal": 3500.00
  }
]
```

---

#### **15. ADICIONAR ITEM AO CARRINHO**
```
POST http://localhost:8080/api/carrinho/adicionar
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Body (JSON):**
```json
{
  "produtoId": 1,
  "quantidade": 2
}
```

**Resposta Esperada (200):**
```json
{
  "idCarrinho": 1,
  "usuario": {
    "id": 1,
    "email": "joao@test.com",
    "nomeCompleto": "João Silva"
  },
  "produto": {
    "idProduto": 1,
    "nomeProduto": "Livro de Programação",
    "preco": 49.90,
    "estoque": 3
  },
  "quantidade": 2,
  "subtotal": 99.80
}
```

---

#### **16. ATUALIZAR QUANTIDADE DE ITEM NO CARRINHO**
```
PUT http://localhost:8080/api/carrinho/{id}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Exemplo:**
```
PUT http://localhost:8080/api/carrinho/1
```

**Body (JSON):**
```json
{
  "quantidade": 5
}
```

**Resposta Esperada (200):**
```json
{
  "idCarrinho": 1,
  "usuario": {
    "id": 1,
    "email": "joao@test.com",
    "nomeCompleto": "João Silva"
  },
  "produto": {
    "idProduto": 1,
    "nomeProduto": "Livro de Programação",
    "preco": 49.90,
    "estoque": 3
  },
  "quantidade": 5,
  "subtotal": 249.50
}
```

---

#### **17. REMOVER ITEM DO CARRINHO**
```
DELETE http://localhost:8080/api/carrinho/{id}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Exemplo:**
```
DELETE http://localhost:8080/api/carrinho/1
```

**Resposta Esperada (204):** Sem conteúdo (No Content)

---

#### **18. LIMPAR CARRINHO INTEIRO**
```
DELETE http://localhost:8080/api/carrinho
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resposta Esperada (204):** Sem conteúdo (No Content)

---

#### **19. OBTER TOTAL DO CARRINHO**
```
GET http://localhost:8080/api/carrinho/total
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resposta Esperada (200):**
```json
{
  "total": 3599.80
}
```



---

## 🔐 FLUXO COMPLETO DE TESTE (PASSO A PASSO)

### **ETAPA 1: Cadastrar novo usuário**

1. **No ApiDog**, clique em **"+"** para criar uma nova requisição
2. Selecione **POST**
3. Cole a URL: `http://localhost:8080/api/auth/register`
4. Vá para **Headers** e adicione:
   - Key: `Content-Type`
   - Value: `application/json`
5. Vá para **Body** e selecione **JSON**
6. Cole o JSON do cadastro:
```json
{
  "nomeCompleto": "Maria Silva",
  "email": "maria@test.com",
  "ra": "987654321",
  "instituicao": "UFBA",
  "cidade": "Salvador",
  "perfil": "usuario",
  "cpfCnpj": "98765432100",
  "dataNascimento": "2002-05-20",
  "senha": "123456",
  "confirmarSenha": "123456"
}
```
7. Clique em **Send** (ou Ctrl+Enter)
8. **Salve o token recebido** em um local seguro

---

### **ETAPA 2: Fazer login (para confirmar)**

1. Nova requisição **POST**
2. URL: `http://localhost:8080/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "email": "maria@test.com",
  "senha": "123456"
}
```
5. Clique em **Send**
6. **Copie o token** da resposta

---

### **ETAPA 3: Verificar token do usuário logado**

1. Nova requisição **GET**
2. URL: `http://localhost:8080/api/auth/me`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {COLE_O_TOKEN_AQUI}`
4. Clique em **Send**
5. Você deve receber os dados do usuário

---

### **ETAPA 4: Verificar categorias**

1. Nova requisição **GET**
2. URL: `http://localhost:8080/api/categorias`
3. Headers: `Content-Type: application/json`
4. Clique em **Send**
5. Verifique se aparecem categorias

---

### **ETAPA 5: Criar um produto**

1. Nova requisição **POST**
2. URL: `http://localhost:8080/api/produtos`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {COLE_O_TOKEN_SALVO}`
4. Body (JSON):
```json
{
  "nomeProduto": "Notebook Gamer",
  "descricao": "Notebook i7, 16GB RAM, RTX 3050",
  "estoque": 2,
  "preco": 3500.00,
  "status": "ATIVO",
  "dimensoes": "35x25x2 cm",
  "peso": 1.8,
  "categoria": {
    "idCategoria": 2
  }
}
```
5. Clique em **Send**
6. **Verifique a resposta**: deve retornar o produto com ID, usuário vinculado, categoria preenchida

---

### **ETAPA 6: Listar meus produtos**

1. Nova requisição **GET**
2. URL: `http://localhost:8080/api/produtos/usuario`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {COLE_O_TOKEN_SALVO}`
4. Clique em **Send**
5. **ESPERADO**: Array com o produto que criou em ETAPA 5

---

### **ETAPA 7: Adicionar ao carrinho**

1. Nova requisição **POST**
2. URL: `http://localhost:8080/api/carrinho/adicionar`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {COLE_O_TOKEN_SALVO}`
4. Body (JSON):
```json
{
  "produtoId": 1,
  "quantidade": 2
}
```
5. Clique em **Send**
6. **ESPERADO**: Item adicionado ao carrinho com subtotal

---

### **ETAPA 8: Listar carrinho**

1. Nova requisição **GET**
2. URL: `http://localhost:8080/api/carrinho`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {COLE_O_TOKEN_SALVO}`
4. Clique em **Send**
5. **ESPERADO**: Array com itens do carrinho

---

### **ETAPA 9: Obter total do carrinho**

1. Nova requisição **GET**
2. URL: `http://localhost:8080/api/carrinho/total`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {COLE_O_TOKEN_SALVO}`
4. Clique em **Send**
5. **ESPERADO**: Valor total do carrinho

---

## 🐛 ERROS COMUNS E SOLUÇÕES

| Erro | Causa | Solução |
|------|-------|---------|
| **401 Unauthorized** | Token inválido ou expirado | Faça login novamente e copie o novo token |
| **400 Bad Request** | Dados inválidos (data, email, etc) | Verifique se a data está em formato ISO (YYYY-MM-DD) |
| **404 Not Found** | Recurso não encontrado | Verifique o ID do produto/categoria |
| **500 Internal Server Error** | Erro no backend | Verifique os logs do servidor (backend) |
| **Email já cadastrado** | Email já existe | Use outro email para cadastro |
| **RA já cadastrado** | RA já existe | Use outro RA (9 dígitos) |
| **Categoria não encontrada** | ID da categoria não existe | Consulte `/api/categorias` primeiro |
| **Estoque insuficiente** | Número de itens no carrinho excede estoque | Reduza a quantidade |

---

## 💡 DICAS DO APIDOG

### **Usar variáveis para o token:**
1. Em qualquer campo, clique em **{x}**
2. Selecione **Create Variable**
3. Name: `token`
4. Value: Cole o token recebido
5. Agora use `{{token}}` em Authorization

### **Exemplo com variável:**
```
Authorization: Bearer {{token}}
```

### **Salvar requisições em coleções:**
1. Clique em **Save** após criar uma requisição
2. Escolha ou crie uma coleção (ex: "CampusShop API")
3. Name: "Cadastrar Usuário"
4. Reutilize depois!

---

## 📊 CHECKLIST DE TESTES COMPLETO

### **Autenticação**
- [ ] **Cadastro**: POST `/api/auth/register` → Status 201
- [ ] **Login**: POST `/api/auth/login` → Status 200, token recebido
- [ ] **Me**: GET `/api/auth/me` → Status 200, dados do usuário

### **Categorias**
- [ ] **Listar**: GET `/api/categorias` → Status 200, array de categorias
- [ ] **Criar**: POST `/api/categorias` → Status 201 (requer token)

### **Produtos**
- [ ] **Listar todos**: GET `/api/produtos` → Status 200
- [ ] **Buscar por ID**: GET `/api/produtos/1` → Status 200
- [ ] **Meus produtos**: GET `/api/produtos/usuario` → Status 200 (requer token)
- [ ] **Criar**: POST `/api/produtos` → Status 200 (requer token)
- [ ] **Atualizar**: PUT `/api/produtos/1` → Status 200 (requer token)
- [ ] **Marcar inativo**: DELETE `/api/produtos/1/inativo` → Status 204
- [ ] **Marcar fora estoque**: DELETE `/api/produtos/1/fora-estoque` → Status 204
- [ ] **Deletar**: DELETE `/api/produtos/1` → Status 204

### **Carrinho**
- [ ] **Listar**: GET `/api/carrinho` → Status 200 (requer token)
- [ ] **Adicionar**: POST `/api/carrinho/adicionar` → Status 200 (requer token)
- [ ] **Atualizar quantidade**: PUT `/api/carrinho/1` → Status 200 (requer token)
- [ ] **Remover item**: DELETE `/api/carrinho/1` → Status 204 (requer token)
- [ ] **Limpar carrinho**: DELETE `/api/carrinho` → Status 204 (requer token)
- [ ] **Total**: GET `/api/carrinho/total` → Status 200 (requer token)

### **Validação**
- [ ] **Data**: Cadastro com `dataNascimento` em formato ISO (YYYY-MM-DD)
- [ ] **Email**: Validar que email precisa ser único
- [ ] **RA**: Validar que RA precisa ser único (9 dígitos)
- [ ] **Produto**: Associação correta com usuário logado

---

**Teste agora e me envie os resultados! 🚀**
