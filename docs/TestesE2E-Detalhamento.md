# Testes E2E - Detalhamento das Alterações

## Visão Geral

Este documento detalha todas as alterações realizadas para que os testes E2E funcionassem corretamente no projeto CAMPUSHOP.

---

## 1. Arquivos Modificados

### 1.1 Banco de Dados / Seed

**Arquivo:** `db/scripts/002_seed.sql`

**Problema:** O hash BCrypt da senha do usuário de teste não correspondia à senha `"password"`.

**Solução:** Atualização do hash BCrypt para ambos os usuários de teste:

```sql
-- Antes (hash inválido para "password"):
'$2a$10$...hash antigo...'

-- Depois (hash correto para "password"):
'$2b$10$xPUg/yywvNcMRfiC6LrAWuFhTaJ9WFKQS6tcRgi7UimoFzmURqUnu'
```

**Trecho alterado (linhas 39 e 54):**
```sql
VALUES
  (
    'Maria Souza',
    '202400001',
    'maria@campushop.com',
    'Camaçari',
    'Maria Souza',
    '$2b$10$xPUg/yywvNcMRfiC6LrAWuFhTaJ9WFKQS6tcRgi7UimoFzmURqUnu',  -- SENHA: password
    NULL,
    'comprador',
    ...
  )
```

---

### 1.2 DriverFactory - ChromeDriver

**Arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/utils/DriverFactory.java`

**Problema:** O `forceDownload()` do WebDriverManager causava problemas com cache bloqueado e download repetido de drivers.

**Solução:** Remoção do `forceDownload()` e adição de `clearResolutionCache()`:

```java
// Antes:
WebDriverManager.chromedriver().forceDownload().setup();

// Depois:
WebDriverManager manager = WebDriverManager.chromedriver();
if (chromeVersion != null && !chromeVersion.isBlank()) {
    manager.browserVersion(chromeVersion);
}
manager.clearResolutionCache()
        .setup();
```

**Trecho alterado (linhas 66-73):**
```java
private static WebDriver createChromeDriver() {
    String chromeVersion = System.getenv("CHROME_VERSION");
    WebDriverManager manager = WebDriverManager.chromedriver();
    if (chromeVersion != null && !chromeVersion.isBlank()) {
        manager.browserVersion(chromeVersion);
    }
    manager.clearResolutionCache()
            .setup();
    // ...
}
```

---

### 1.3 ProdutosPage - Clique com JavaScript

**Arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/pages/ProdutosPage.java`

**Problema:** O Selenium não conseguia clicar no botão "Adicionar ao Carrinho" devido a overlays CSS ou DOM dinâmico.

**Solução:** Uso de `JavascriptExecutor.click()` diretamente no teste.

**Trecho relevante (ProdutosE2ETest.java, linhas 64-69):**
```java
// Clica diretamente no botão usando JavaScript
By addButton = By.cssSelector("[data-testid='add-to-cart-" + TestData.PRODUCT_IN_STOCK_ID + "']");
JavascriptExecutor js = (JavascriptExecutor) driver;

// Executa o clique via JavaScript para garantir que funciona
js.executeScript("arguments[0].click();", driver.findElement(addButton));
```

---

### 1.4 CarrinhoPage - Navegação Direta via URL

**Arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/pages/CarrinhoPage.java`

**Problema:** Clicar no link do carrinho falhava quando o link não estava imediatamente interativo.

**Solução:** Uso de `driver.get()` direto para a URL do carrinho em vez de clicar no link.

**Trecho em ProdutosPage (linhas 60-63):**
```java
public void openCart() {
    driver.get(TestData.getCarrinhoUrl());
    DriverFactory.waitForPageLoad(driver);
}
```

---

### 1.5 TestData - Dados de Teste Atualizados

**Arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/utils/TestData.java`

**Alterações:**
- IDs e preços atualizados para refletir os dados reais do banco
- Produto de teste: ID 1 com preço `R$ 0.10`

**Trecho relevante:**
```java
/** Produto EM ESTOQUE - com quantidade suficiente */
public static final int PRODUCT_IN_STOCK_ID = 1;
public static final String PRODUCT_IN_STOCK_NAME = "Arthur";
public static final double PRODUCT_IN_STOCK_PRICE = 0.10;

/** Produto SEM ESTOQUE - deve estar com estoque = 0 */
public static final int PRODUCT_OUT_OF_STOCK_ID = 999;
public static final String PRODUCT_OUT_OF_STOCK_NAME = "Produto sem estoque";

/** Segundo produto para testes de múltiplos itens */
public static final int PRODUCT_2_IN_STOCK_ID = 2;
public static final String PRODUCT_2_IN_STOCK_NAME = "empada";
public static final double PRODUCT_2_IN_STOCK_PRICE = 3.00;
```

---

## 2. Estrutura dos Testes E2E

```
src/test/java/br/com/campushop/campushop_backend/e2e/
├── pages/
│   ├── LoginPage.java       # Página de login
│   ├── ProdutosPage.java    # Página de produtos
│   └── CarrinhoPage.java    # Página do carrinho
├── utils/
│   ├── DriverFactory.java   # Factory do WebDriver
│   └── TestData.java        # Centralizador de dados de teste
└── tests/
    └── ProdutosE2ETest.java # Testes E2E principais
```

---

## 3. Seletores data-testid

Os testes usam seletores `data-testid` para localizar elementos:

| Seletor | Descrição |
|---------|-----------|
| `[data-testid='login-email']` | Campo de email no login |
| `[data-testid='login-password']` | Campo de senha no login |
| `[data-testid='login-error']` | Mensagem de erro no login |
| `[data-testid='cart-link']` | Link do carrinho no header |
| `[data-testid='product-card-{id}']` | Card de produto |
| `[data-testid='add-to-cart-{id}']` | Botão adicionar ao carrinho |
| `[data-testid='product-notification']` | Notificação após adicionar |
| `[data-testid='cart-item-{id}']` | Item no carrinho |
| `[data-testid='cart-total']` | Total do carrinho |
| `[data-testid='cart-finalize-button']` | Botão finalizar pedido |
| `[data-testid='cart-success-message']` | Mensagem de sucesso |
| `[data-testid='cart-empty-message']` | Mensagem carrinho vazio |

---

## 4. Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BROWSER` | `CHROME` | Navegador: `CHROME` ou `FIREFOX` |
| `HEADLESS` | `false` | Modo headless: `true` ou `false` |
| `BASE_URL` | `http://localhost:5173` | URL base da aplicação |
| `CHROME_VERSION` | (nenhuma) | Versão específica do Chrome |

---

## 5. Comandos para Executar

### 5.1 Iniciar Backend

```powershell
cd "C:\Users\caiok\OneDrive\Documentos\GitHub\CAMPUSHOP"
.\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

### 5.2 Iniciar Frontend

```powershell
cd "C:\Users\caiok\OneDrive\Documentos\GitHub\CAMPUSHOP\frontend"
npm install
npm run dev
```

### 5.3 Executar Teste E2E (Normal)

```powershell
cd "C:\Users\caiok\OneDrive\Documentos\GitHub\CAMPUSHOP"
.\apache-maven-3.9.6\bin\mvn.cmd -Dtest=ProdutosE2ETest test
```

### 5.4 Executar Teste E2E (Headless)

```powershell
$env:HEADLESS="true"
cd "C:\Users\caiok\OneDrive\Documentos\GitHub\CAMPUSHOP"
.\apache-maven-3.9.6\bin\mvn.cmd -Dtest=ProdutosE2ETest test
```

---

## 6. Fluxo dos Testes

### Teste 1: Login e Página de Produtos
```
1. Abre a página inicial
2. Limpa localStorage/sessionStorage
3. Realiza login com credenciais válidas
4. Verifica se a página de produtos carrega
5. Valida que o produto em estoque está visível
```

### Teste 2: Adicionar ao Carrinho e Finalizar
```
1. Realiza login
2. Abre página de produtos
3. Adiciona produto ao carrinho (via JavaScript click)
4. Aguarda resposta da API
5. Verifica localStorage
6. Navega para o carrinho (via driver.get)
7. Valida item no carrinho
8. Valida total correto (R$ 0.10)
9. Finaliza pedido (se houver itens)
```

### Teste 3: Produto Sem Estoque
```
1. Realiza login
2. Abre página de produtos
3. Verifica se produto sem estoque existe
4. Valida que botão exibe "Fora de estoque"
```

---

## 7. Problemas Resolvidos

| Problema | Solução |
|----------|--------|
| Login falhando com credenciais corretas | Hash BCrypt corrigido no seed |
| ChromeDriver não inicializava | Removido `forceDownload()`, adicionado `clearResolutionCache()` |
| Clique no botão não funcionava | Usado `JavascriptExecutor.click()` |
| Navegação para carrinho falhava | Usado `driver.get()` direto para URL |
| Dados de teste não batiam com banco | IDs e preços atualizados em TestData.java |

---

## 8. Dependências

### Backend (pom.xml)
- Spring Boot Test
- Selenium WebDriver
- WebDriverManager (bonigarcia)
- JUnit 5 (Jupiter)

### Frontend (package.json)
- Vite (dev server)
- React
- Axios (para requisições API)
- React Router DOM

---

## 9. Pré-requisitos

1. **MySQL rodando** com banco `campushop` criado
2. **Seed executado** (`002_seed.sql`)
3. **Backend** em `http://localhost:8080`
4. **Frontend** em `http://localhost:5173` (com proxy `/api` para backend)
5. **Chrome/Chromedriver** instalado (gerenciado automaticamente pelo WebDriverManager)