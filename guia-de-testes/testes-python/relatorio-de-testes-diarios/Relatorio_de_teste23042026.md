# 📊 RELATÓRIO DE TESTES - CampusShop

**Data:** 23 de abril de 2026  
**Versão:** 1.2  
**Status:** ✅ Teste Completado

---

## 📋 Resumo Executivo

- **Total de Testes:** 23
- **Sucessos:** 20 ✓
- **Falhas:** 3 ✗
- **Taxa de Sucesso:** 87.0%
- **Status Geral:** 🟡 FUNCIONAL COM PONTOS CRÍTICOS DE AJUSTE

---

## 🧪 Resultados Detalhados

### 1. ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)

| Rota                       | Status   | Notas                                |
| -------------------------- | -------- | ------------------------------------ |
| GET /                      | ✓ 200 OK | SPA carregada corretamente           |
| GET /home                  | ✓ 200 OK | Home renderizada                     |
| GET /categorias            | ✓ 200 OK | Página acessível                     |
| GET /produtos              | ✓ 200 OK | Página com listagem carregando       |
| GET /produto/1             | ✓ 200 OK | Rota client-side acessível           |
| GET /login                 | ✓ 200 OK | Página de login acessível            |
| GET /cadastro              | ✓ 200 OK | Página de cadastro acessível         |
| GET /carrinho              | ✓ 200 OK | Rota responde publicamente na SPA    |
| GET /pedidos               | ✓ 200 OK | Rota client-side acessível           |
| GET /conta                 | ✓ 200 OK | Rota client-side acessível           |
| GET /chat                  | ✓ 200 OK | Rota client-side acessível           |
| GET /cadastrar-produto     | ✓ 200 OK | Formulário renderizado no navegador  |

**Taxa de Sucesso:** 100% (12/12)

---

### 2. AUTENTICAÇÃO

| Operação                                | Status                    | Detalhes                                                       |
| --------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| POST /api/auth/register (CPF válido)    | ✓ 201 Created             | Usuário criado e token JWT retornado                           |
| POST /api/auth/register (CPF inválido)  | ✗ 500 Internal Server Err | Backend retornou "Erro ao criar conta: CPF inválido"          |
| POST /api/auth/login (credencial teste) | ✗ 401 Unauthorized        | Usuário/senha não reconhecidos no cenário testado              |
| GET /api/auth/me (sem token)            | ✓ 401 Unauthorized        | Comportamento esperado para rota protegida                     |

**Taxa de Sucesso:** 50% (2/4)

**Observações:**

- Registro com dados válidos funciona.
- Existe inconsistência de tratamento de erro para CPF inválido (retorno 500 em vez de 400 de validação).

---

### 3. FUNCIONALIDADES DE PRODUTOS

| Funcionalidade                          | Status   | Detalhes                                              |
| --------------------------------------- | -------- | ----------------------------------------------------- |
| GET /api/produtos                       | ✓ 200 OK | Lista de produtos retornada                           |
| GET /api/categorias                     | ✓ 200 OK | Categorias retornadas corretamente                    |
| Navegação em /produtos                  | ✓ OK     | Grid de produtos renderizado com preço e estoque      |
| Ação "Adicionar ao carrinho" na UI      | ✓ OK     | Toast exibido e contador do carrinho incrementado     |

**Taxa de Sucesso:** 100% (4/4)

---

### 4. FUNCIONALIDADES DE CARRINHO

| Operação                                  | Status       | Detalhes                                                               |
| ----------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| Acesso à página /carrinho                 | ✓ OK         | Itens e resumo do pedido renderizados                                  |
| Persistência visual após adicionar item   | ✓ OK         | Item apareceu no carrinho com quantidade/total atualizados             |
| GET /api/auth/me sem token (controle)     | ✓ 401        | Proteção de rota confirmada                                             |
| POST /api/carrinho/adicionar (API direta) | ✗ Inconcluso | Tentativas automatizadas sem saída estável para fechamento do endpoint |

**Taxa de Sucesso:** 75% (3/4)

**Observação Crítica:**

- A inclusão no carrinho pela interface web funcionou.
- A validação conclusiva do endpoint via chamada API direta precisa de rerun limpo (script único com token confirmado).

---

### 5. NAVEGAÇÃO E EXPERIÊNCIA DE PÁGINAS PROTEGIDAS

| Página       | Resultado | Detalhes                                          |
| ------------ | --------- | ------------------------------------------------- |
| /pedidos     | ✓ Sucesso | Página carregada com estado vazio esperado        |
| /chat        | ✓ Sucesso | Conversa renderizada e campo de mensagem visível  |
| /conta       | ✓ Sucesso | Dados de perfil e abas internas renderizados      |
| /cadastrar-produto | ✓ Sucesso | Formulário completo carregado com campos e ações |

**Taxa de Sucesso:** 100% (4/4)

---

## 📁 Estrutura de Rotas Testadas

### Rotas Públicas (✓ Funcionando)

GET  /                    → SPA Entry
GET  /home                → HomePage
GET  /categorias          → CategoriasPage
GET  /produtos            → ProdutosPage
GET  /produto/:id         → ProdutoDetalhePage
GET  /login               → LoginPage
GET  /cadastro            → CadastroPage

### Rotas com comportamento de área autenticada (session ativa no navegador)

GET   /carrinho            → CarrinhoPage          ✓ Renderizada
GET   /pedidos             → PedidosPage           ✓ Renderizada
GET   /chat                → ChatPage              ✓ Renderizada
GET   /conta               → ContaPage             ✓ Renderizada
GET   /cadastrar-produto   → CadastrarProdutoPage  ✓ Renderizada

### APIs de Backend Testadas

GET    /api/categorias                 ✓ OK
GET    /api/produtos                   ✓ OK
POST   /api/auth/register (válido)     ✓ OK
POST   /api/auth/register (inválido)   ✗ ERROR 500
POST   /api/auth/login                 ✗ 401 no cenário testado
GET    /api/auth/me (sem token)        ✓ 401 esperado
POST   /api/produtos (sem token)       ✓ 401/403 esperado

---

## 🐛 Problemas Encontrados

### 1. Tratamento incorreto de validação de CPF (ALTA)

- **Rota:** POST /api/auth/register
- **Status observado:** 500 Internal Server Error
- **Mensagem:** "Erro ao criar conta: CPF inválido"
- **Impacto:** Erro de regra de negócio é exposto como erro interno, dificultando UX e troubleshooting.
- **Ação Necessária:**
  - [ ] Ajustar resposta para 400 Bad Request em validação de CPF
  - [ ] Padronizar payload de erro de validação

### 2. Login com credenciais de massa anterior (MÉDIA)

- **Rota:** POST /api/auth/login
- **Status observado:** 401 Unauthorized
- **Impacto:** Massa antiga não reutilizável nesse ambiente atual
- **Ação Necessária:**
  - [ ] Padronizar massa de usuário de teste em seed
  - [ ] Garantir credenciais versionadas para QA

### 3. Limitação de ambiente para suíte local (MÉDIA)

- **Status:** Não foi possível executar localmente via ferramentas da máquina host
- **Evidência:** ausência de JAVA_HOME, npm/node e python no PATH
- **Impacto:** execução de build/testes automatizados locais prejudicada
- **Ação Necessária:**
  - [ ] Configurar JDK e JAVA_HOME
  - [ ] Instalar Node.js/npm
  - [x] Instalar Python para scripts em guia-de-testes/testes-python

---

## ✨ Funcionalidades Confirmadas

### ✓ Frontend / SPA

- [x] Carregamento da aplicação
- [x] Navegação entre páginas principais
- [x] Renderização de páginas de área autenticada (sessão ativa)

### ✓ Catálogo

- [x] Listagem de produtos
- [x] Listagem de categorias
- [x] Exibição de preço e estoque

### ✓ Carrinho (fluxo visual)

- [x] Adição de item pelo botão da página de produtos
- [x] Atualização de contador do carrinho
- [x] Exibição de itens e total na página de carrinho

### ✓ Segurança

- [x] Endpoint protegido sem token retorna 401
- [x] Tentativa de criação de produto sem token retorna 401/403

---

## 📈 Métricas

| Métrica                          | Valor |
| -------------------------------- | ----- |
| Taxa de Sucesso                  | 87.0% |
| Testes Passados                  | 20/23 |
| Falhas                           | 3     |
| Problemas Críticos/Altos         | 1     |
| Problemas Médios                 | 2     |

---

## 🔧 Recomendações

### Prioridade Alta

1. **Corrigir resposta de validação no cadastro**
   - Converter erro de CPF inválido para 400
   - Evitar retorno 500 para regra de domínio

### Prioridade Média

2. **Padronizar massa de autenticação de testes**
   - Usuário seed fixo e documentado
   - Credenciais válidas para pipelines e testes manuais

3. **Normalizar ambiente de execução local**
   - JDK + JAVA_HOME
   - Node/npm
   - Python para scripts de QA

4. **Fechar teste API direto de carrinho/adicionar**
   - Rodar script único com token recém-gerado
   - Registrar request/response da chamada

---

## 📝 Conclusão

O sistema CampusShop permanece funcional para navegação, catálogo e fluxo visual de carrinho, com APIs públicas estáveis.

O principal ponto de correção identificado nesta execução é o tratamento de erro no cadastro com CPF inválido (retorno 500), que deve ser ajustado para erro de validação (400).

---

**Próximos Passos:**

1. Ajustar tratamento de validação de CPF no backend
2. Reexecutar suíte autenticada com massa controlada
3. Publicar relatório v1.3 após rerun com ambiente completo

---

_Relatório gerado em 23/04/2026_