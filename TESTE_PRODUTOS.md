# 🧪 TESTE COMPLETO - CADASTRO E LISTAGEM DE PRODUTOS

## ✅ Pré-requisitos
- Docker rodando: `docker-compose up -d`
- Backend rodando: `mvn spring-boot:run` (porta 8080)
- Frontend compilado: `npm run build` (em `frontend/`)

---

## 🔄 FLUXO DE TESTE

### **ETAPA 1: Limpar o localStorage**
```javascript
// F12 → Console e execute:
localStorage.clear()
console.log("✓ localStorage limpo")
```

---

### **ETAPA 2: Cadastrar um novo usuário**
- Acesse: `http://localhost:8080/` 
- Clique em **"Iniciar como novo usuário"** (ou similar)
- Preencha o formulário com:
  - **Nome Completo**: `Teste Usuario`
  - **Email**: `teste@example.com`
  - **R.A**: `202401`
  - **Instituição**: `UNIFESP`
  - **Cidade**: `São José dos Campos`
  - **CPF**: `12345678901`
  - **Data de Nascimento**: `01/01/2000`
  - **Senha**: `123456`
  - **Confirmar Senha**: `123456`

Clique em **"Cadastrar"**

---

### **ETAPA 3: Fazer login**
- Email: `teste@example.com`
- Senha: `123456`
- Clique em **"Entrar"**

---

### **ETAPA 4: Anunciar um produto**
- Navegue para **"Minha Conta"**
- Clique em **"+ Anunciar produto"**
- Preencha o formulário:
  - **Nome do produto**: `Livro de Programação`
  - **Descrição**: `Livro Python 3.10 - Excelente estado`
  - **Estoque**: `3`
  - **Preço**: `49.90`
  - **Categoria**: `Livros`
  - **Dimensões**: `20x15x2 cm`
  - **Peso (opcional)**: `0.5`

- Clique em **"Cadastrar produto"**

---

### **ETAPA 5: Validar "Meus Produtos"**
- Você será redirecionado para `/conta`
- Acesse a aba **"Meus Produtos"**
- **ESPERADO**: O produto "Livro de Programação" deve aparecer na lista com:
  - ✅ Nome: `Livro de Programação`
  - ✅ Descrição: `Livro Python 3.10 - Excelente estado`
  - ✅ Preço: `R$ 49.90`
  - ✅ Estoque: `3`

---

### **ETAPA 6: Testar API diretamente (DevTools)**
```javascript
// F12 → Console:

// 1. Verificar token
console.log("Token:", localStorage.getItem('token'))

// 2. Chamar /api/produtos/usuario
fetch('http://localhost:8080/api/produtos/usuario', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Meus Produtos:', data)
  console.log('Total:', data.length)
  if (data.length > 0) {
    console.log('Primeiro produto:', data[0])
  }
})
.catch(e => console.error('Erro:', e))
```

**ESPERADO**: Array com o produto que você criou

---

### **ETAPA 7: Cadastrar segundo produto (para validar múltiplos)**
- Volte para **"Anunciar produto"**
- Crie outro produto diferente:
  - **Nome**: `Caderno 200 folhas`
  - **Descrição**: `Caderno pautado, capa dura`
  - **Estoque**: `10`
  - **Preço**: `15.90`
  - **Categoria**: `Livros`

- Clique em **"Cadastrar produto"**
- Verifique em **"Meus Produtos"** se aparecem os 2 produtos

---

## ✅ RESULTADO ESPERADO

Após completar todos os testes:
- ✅ Produtos criados aparecem em "Meus Produtos"
- ✅ Campo `categoria` é preenchido corretamente
- ✅ Campo `usuario` vinculado ao usuário logado
- ✅ Endpoint `/api/produtos/usuario` retorna array com todos os produtos do usuário
- ✅ Frontend renderiza os produtos com types corretos (sem erros TS)

---

## 🐛 TROUBLESHOOTING

### ❌ Problema: "Erro ao cadastrar produto"
**Solução:**
```javascript
// Verificar no console do navegador qual é o erro exato
// Se for 401 → token expirou, faça logout e login novamente
// Se for categoria não encontrada → backend não tem categorias
```

### ❌ Problema: "Você ainda não anunciou nenhum produto"
**Solução:**
1. Verifique no DevTools → Network se `GET /api/produtos/usuario` retorna:
   - 401 → Token inválido
   - 200 com `[]` → Produtos não foram salvos
   - 200 com dados → Verifique frontend rendering

2. Checke o log do backend:
```
mvn spring-boot:run | grep -i "produto\|categoria\|usuario"
```

### ❌ Problema: Categoria não aparece no dropdown
**Solução:**
```javascript
// No console do frontend:
fetch('http://localhost:8080/api/categorias')
  .then(r => r.json())
  .then(cats => console.log('Categorias disponíveis:', cats))
```

Se retornar array vazio, o seeder não rodou. Reinicie o servidor:
```bash
mvn clean spring-boot:run
```

---

## 📊 CASOS DE TESTE COBERTOS

| Caso | Descrição | Status |
|------|-----------|--------|
| CT-001 | Usuário consegue cadastrar produto | 🔄 Testing |
| CT-002 | Produto vinculado ao usuário correto | 🔄 Testing |
| CT-003 | Categoria carregada corretamente | 🔄 Testing |
| CT-004 | Endpoint `/api/produtos/usuario` retorna dados | 🔄 Testing |
| CT-005 | Frontend renderiza produtos em "Meus Produtos" | 🔄 Testing |
| CT-006 | Múltiplos produtos do mesmo usuário aparecem | 🔄 Testing |

---

**Data do Teste**: 15/04/2026
**Versão Backend**: 0.0.1-SNAPSHOT (Spring Boot 3.1.5)
**Versão Frontend**: React 18 + Vite 5
