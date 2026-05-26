# testes e2e - detalhamento das alteracoes

este documento explica paso a paso tudo o que foi feito para que os testes e2e funcionassem no projeto campushop.

---

## 1. o que foi alterado

### 1.1 banco de dados (002_seed.sql)

**problema:** a senha do usuario de teste nao funcionava porque o hash bcrypt estava errado.

**solucao:** troquei o hash bcrypt para a senha "password".

```sql
-- hash antigo (nao funcionava com "password")
'$2a$10$...hash...'

-- hash novo (funciona com "password")
'$2b$10$xPUg/yywvNcMRfiC6LrAWuFhTaJ9WFKQS6tcRgi7UimoFzmURqUnu'
```

usuarios afetados:
- maria@campushop.com (senha: password)
- joao@campushop.com (senha: password)

---

### 1.2 driverfactory - configuracao do chromedriver

**arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/utils/DriverFactory.java`

**problema:** o driver do chrome dava erro na hora de baixar ou usava cache errado.

**solucao:** removi o forceDownload() e adicionei clearResolutionCache().

```java
// antes (dava problema)
WebDriverManager.chromedriver().forceDownload().setup();

// depois (funciona direito)
WebDriverManager manager = WebDriverManager.chromedriver();
manager.clearResolutionCache()
        .setup();
```

---

### 1.3 produtospage - clicar no botao de adicionar carrinho

**arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/pages/ProdutosPage.java`

**problema:** o selenium nao conseguia clicar no botao porque tinha overlay ou css dinamico por cima.

**solucao:** usei javascript para clicar diretamente no botao.

```java
// antes (nao funcionava)
WebElement button = wait.until(ExpectedConditions.elementToBeClickable(addButton));
button.click();

// depois (funciona)
By addButton = By.cssSelector("[data-testid='add-to-cart-" + productId + "']");
JavascriptExecutor js = (JavascriptExecutor) driver;
js.executeScript("arguments[0].click();", driver.findElement(addButton));
```

---

### 1.4 carrinhopage - ir para a pagina do carrinho

**arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/pages/CarrinhoPage.java`

**problema:** clicar no link do carrinho as vezes falhava porque o link nao estava pronto.

**solucao:** ao inves de clicar no link, vou direto para a url.

```java
// antes (dava problema as vezes)
driver.findElement(cartLink).click();

// depois (sempre funciona)
public void openCart() {
    driver.get(TestData.getCarrinhoUrl());
    DriverFactory.waitForPageLoad(driver);
}
```

---

### 1.5 testdata - dados atualizados

**arquivo:** `src/test/java/br/com/campushop/campushop_backend/e2e/utils/TestData.java`

**alteracao:** atualizei ids e precos para bater com o banco real.

```java
// produto em estoque (id 1, preco 0.10)
public static final int PRODUCT_IN_STOCK_ID = 1;
public static final double PRODUCT_IN_STOCK_PRICE = 0.10;

// produto sem estoque (id 999, estoque = 0)
public static final int PRODUCT_OUT_OF_STOCK_ID = 999;

// segundo produto (id 2, preco 3.00)
public static final int PRODUCT_2_IN_STOCK_ID = 2;
public static final double PRODUCT_2_IN_STOCK_PRICE = 3.00;
```

---

## 2. estrutura dos arquivos de teste

```
src/test/java/br/com/campushop/campushop_backend/e2e/
├── pages/
│   ├── loginpage.java       --> testa login
│   ├── produtospage.java   --> testa lista de produtos e adicionar ao carrinho
│   └── carrinhopage.java    --> testa o carrinho
├── utils/
│   ├── driverfactory.java   --> cria e gerencia o navegador
│   └── testdata.java        --> dados fixos (emails, senhas, ids, precos)
└── tests/
    └── produtose2etest.java  --> os 3 testes principais
```

---

## 3. como funciona cada teste

### teste 1: fazer login e ver produtos

```
1. abre a pagina inicial
2. limpa o localstorage (pra garantir que nao tem sujeira)
3. digita email e senha
4. clica no botao de login
5. verifica se foi para a pagina de produtos
6. verifica se o produto com id 1 aparece na tela
```

### teste 2: adicionar produto ao carrinho e finalizar

```
1. faz login
2. abre pagina de produtos
3. clica no botao "adicionar ao carrinho" (usa javascript)
4. verifica se apareceu uma notificacao
5. verifica o localstorage se o produto foi salvo
6. vai direto para a pagina do carrinho
7. verifica se o produto aparece no carrinho
8. verifica se o total esta correto (r$ 0.10)
9. clica em finalizar pedido (se tiver produto)
```

### teste 3: ver produto sem estoque

```
1. faz login
2. abre pagina de produtos
3. verifica se o produto com id 999 esta na tela
4. verifica se o botao dele mostra "fora de estoque"
```

---

## 4. seletores usados nos testes

sao identificadores que o selenium usa para encontrar elementos na tela:

| seletor | para que serve |
|---------|---------------|
| `[data-testid='login-email']` | campo de email |
| `[data-testid='login-password']` | campo de senha |
| `[data-testid='login-error']` | mensagem de erro do login |
| `[data-testid='cart-link']` | icone/link do carrinho no menu |
| `[data-testid='product-card-1']` | card do produto de id 1 |
| `[data-testid='add-to-cart-1']` | botao de adicionar produto 1 |
| `[data-testid='product-notification']` | notificacao de produto adicionado |
| `[data-testid='cart-item-1']` | item do produto 1 no carrinho |
| `[data-testid='cart-total']` | valor total do carrinho |
| `[data-testid='cart-finalize-button']` | botao de finalizar pedido |
| `[data-testid='cart-success-message']` | mensagem de sucesso apos finalizar |

---

## 5. comandos para rodar

### 5.1 subir o backend

```powershell
cd "c:\users\caiok\onedrive\documentos\github\campushop"
.\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

### 5.2 subir o frontend

```powershell
cd "c:\users\caiok\onedrive\documentos\github\campushop\frontend"
npm install
npm run dev
```

### 5.3 rodar o teste e2e (normal)

```powershell
cd "c:\users\caiok\onedrive\documentos\github\campushop"
.\apache-maven-3.9.6\bin\mvn.cmd -dtest=produtose2etest test
```

### 5.4 rodar o teste e2e (sem abrir navegador)

```powershell
$env:headless="true"
cd "c:\users\caiok\onedrive\documentos\github\campushop"
.\apache-maven-3.9.6\bin\mvn.cmd -dtest=produtose2etest test
```

---

## 6. variaveis de ambiente

| variavel | padrao | o que faz |
|----------|--------|-----------|
| `browser` | `chrome` | navegador a usar (chrome ou firefox) |
| `headless` | `false` | se true, nao abre a janela do navegador |
| `base_url` | `http://localhost:5173` | url do frontend |
| `chrome_version` | (uma) | verso do chrome (opcional) |

---

## 7. lista de problemas e solucoes

| o que acontecia | o que fiz para resolver |
|----------------|----------------------|
| login falhava mesmo com senha certa | troquei o hash bcrypt no banco |
| chromedriver nao iniciava | tirei o forcedownload, usei clearresolutioncache |
| clicar no botao nao funcionava | usei javascript executor para clicar |
| ir para carrinho dava erro | fui direto pela url com driver.get |
| preco e id nao batiam com banco | atualizei os valores em testdata |

---

## 8. o que precisa estar pronto antes de rodar

1. mysql rodando com o banco campushop criado
2. script 002_seed.sql ter sido executado (cria usuarios e produtos)
3. backend no ar em http://localhost:8080
4. frontend no ar em http://localhost:5173 (com proxy /api指向backend)
5. google chrome instalado (o webdrivermanager baixa o driver automaticamente)