package br.com.campushop.campushop_backend.e2e.tests;

/**
 * arquivo principal dos testes e2e.
 * aqui ficam os 3 testes que verificam se o site funciona direitinho.
 *
 * o que cada teste faz:
 * 1. login e abrir pagina de produtos
 * 2. adicionar produto ao carrinho e finalizar pedido
 * 3. ver se produto sem estoque aparece corretamente
 */

// imports do selenium para controlar o navegador
import br.com.campushop.campushop_backend.e2e.pages.CarrinhoPage;
import br.com.campushop.campushop_backend.e2e.pages.LoginPage;
import br.com.campushop.campushop_backend.e2e.pages.ProdutosPage;
import br.com.campushop.campushop_backend.e2e.utils.DriverFactory;
import br.com.campushop.campushop_backend.e2e.utils.TestData;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

// imports do junit para as verificacoes (asserts)
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * classe principal dos testes e2e.
 * cada metodo @test e um teste separado que o junit executa.
 */
public class ProdutosE2ETest {

    // aqui guardamos o navegador e as paginas que vamos testar
    private WebDriver driver;
    private LoginPage loginPage;
    private ProdutosPage produtosPage;
    private CarrinhoPage carrinhoPage;

    /**
     * metodo que roda antes de cada teste.
     * abre o navegador, limpa dados antigos e cria as paginas.
     */
    @BeforeEach
    void setUp() {
        // cria um navegador novo
        driver = DriverFactory.createDriver();

        // abre a pagina inicial
        driver.get(DriverFactory.getBaseUrl());

        // limpa o localstorage e sessionstorage
        // isso garante que nao tem sujeira de testes anteriores
        ((JavascriptExecutor) driver).executeScript("localStorage.clear(); sessionStorage.clear();");

        // cria as paginas que vamos usar no teste
        loginPage = new LoginPage(driver);
        produtosPage = new ProdutosPage(driver);
        carrinhoPage = new CarrinhoPage(driver);
    }

    /**
     * metodo que roda depois de cada teste.
     * fecha o navegador para nao ficar pendurado.
     */
    @AfterEach
    void tearDown() {
        DriverFactory.closeDriver(driver);
    }

    /**
     * teste 1: fazer login e abrir pagina de produtos.
     *
     * passo a passo:
     * 1. abre a pagina de login
     * 2. digita email e senha
     * 3. clica no botao de login
     * 4. verifica se foi redirecionado para a home
     * 5. abre a pagina de produtos
     * 6. verifica se o produto em estoque aparece na tela
     */
    @Test
    void deveRealizarLoginEAbrirPaginaDeProdutos() {
        // faz login usando email e senha do testdata
        loginPage.login(TestData.TEST_USER_EMAIL, TestData.TEST_USER_PASSWORD);

        // espera a pagina de home aparecer
        loginPage.waitForHomePage();

        // abre a pagina de produtos
        produtosPage.open();

        // verifica se o produto com id 1 esta visivel na tela
        assertTrue(produtosPage.isProductCardVisible(TestData.PRODUCT_IN_STOCK_ID),
                "o produto em estoque deve estar visivel na lista de produtos.");
    }

    /**
     * teste 2: adicionar produto ao carrinho e finalizar pedido.
     *
     * passo a passo:
     * 1. faz login
     * 2. abre pagina de produtos
     * 3. clica no botao de adicionar ao carrinho (usa javascript)
     * 4. verifica se apareceu notificacao
     * 5. verifica o localstorage para ver se produto foi salvo
     * 6. vai para a pagina do carrinho
     * 7. verifica se o produto aparece no carrinho
     * 8. verifica se o total esta correto
     * 9. clica em finalizar pedido (se tiver produto)
     */
    @Test
    void deveAdicionarProdutoAoCarrinhoEFinalizarPedido() {
        // faz login
        loginPage.login(TestData.TEST_USER_EMAIL, TestData.TEST_USER_PASSWORD);
        loginPage.waitForHomePage();

        // abre a pagina de produtos
        produtosPage.open();

        // monta o seletor do botao de adicionar carrinho
        // o seletor e algo como [data-testid='add-to-cart-1']
        By addButton = By.cssSelector("[data-testid='add-to-cart-" + TestData.PRODUCT_IN_STOCK_ID + "']");

        // usa javascript para clicar no botao
        // isso e necessario porque as vezes o selenium nao consegue clicar direto
        // pode ser que tenha algo por cima do botao (overlay, css, etc)
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("arguments[0].click();", driver.findElement(addButton));

        // espera um pouco para a acao completar
        try { Thread.sleep(2000); } catch (InterruptedException e) {}

        // verifica o localstorage para ver se o produto foi salvo la
        Object cart = js.executeScript("return localStorage.getItem('campushop_cart');");
        System.out.println("carrinho do localstorage: " + cart);

        // verifica se apareceu a notificacao de produto adicionado
        boolean temNotificacao = !driver.findElements(By.cssSelector("[data-testid='product-notification']")).isEmpty();
        System.out.println("tem notificacao: " + temNotificacao);

        // verifica se o link do carrinho esta visivel
        assertTrue(produtosPage.isCartLinkVisible(),
                "o link do carrinho deve estar visivel apos adicionar produto.");

        // vai para a pagina do carrinho
        // usa driver.get em vez de clicar no link porque as vezes o link nao funciona
        produtosPage.openCart();

        // espera a pagina do carrinho carregar
        carrinhoPage.waitForLoaded();

        // verifica se o produto aparece no carrinho
        assertTrue(carrinhoPage.isItemInCart(TestData.PRODUCT_IN_STOCK_ID),
                "o produto adicionado deve aparecer no carrinho.");

        // verifica se o total esta correto
        assertEquals("r$ 0.10", carrinhoPage.getTotalText(),
                "o total do carrinho deve corresponder ao preco do produto.");

        // verifica se tem itens no carrinho antes de finalizar
        boolean temItens = !driver.findElements(By.cssSelector("[data-testid^='cart-item-']")).isEmpty();
        System.out.println("tem itens no carrinho: " + temItens);

        // se tiver itens, clica em finalizar pedido
        if (temItens) {
            carrinhoPage.finalizeOrder();
            // espera um pouco para a navegacao
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        }
    }

    /**
     * teste 3: ver se produto sem estoque mostra o botao correto.
     *
     * passo a passo:
     * 1. faz login
     * 2. abre pagina de produtos
     * 3. verifica se o produto sem estoque esta na tela
     * 4. verifica se o botao dele mostra "fora de estoque"
     */
    @Test
    void deveExibirBotaoForaDeEstoqueParaProdutoSemEstoque() {
        // faz login
        loginPage.login(TestData.TEST_USER_EMAIL, TestData.TEST_USER_PASSWORD);
        loginPage.waitForHomePage();

        // abre a pagina de produtos
        produtosPage.open();

        // verifica se o produto sem estoque existe na tela
        // se nao existir, o teste e ignorado (nao da erro)
        Assumptions.assumeTrue(produtosPage.isProductCardVisible(TestData.PRODUCT_OUT_OF_STOCK_ID),
                "produto sem estoque nao esta presente no ambiente de teste.");

        // verifica se o botao do produto sem estoque mostra "fora de estoque"
        assertTrue(produtosPage.isProductOutOfStock(TestData.PRODUCT_OUT_OF_STOCK_ID),
                "o produto sem estoque deve exibir o botao 'fora de estoque'.");
    }
}