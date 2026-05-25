package br.com.campushop.campushop_backend.e2e.tests;

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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ProdutosE2ETest {

    private WebDriver driver;
    private LoginPage loginPage;
    private ProdutosPage produtosPage;
    private CarrinhoPage carrinhoPage;

    @BeforeEach
    void setUp() {
        driver = DriverFactory.createDriver();
        driver.get(DriverFactory.getBaseUrl());
        ((JavascriptExecutor) driver).executeScript("localStorage.clear(); sessionStorage.clear();");

        loginPage = new LoginPage(driver);
        produtosPage = new ProdutosPage(driver);
        carrinhoPage = new CarrinhoPage(driver);
    }

    @AfterEach
    void tearDown() {
        DriverFactory.closeDriver(driver);
    }

    @Test
    void deveRealizarLoginEAbrirPaginaDeProdutos() {
        loginPage.login(TestData.TEST_USER_EMAIL, TestData.TEST_USER_PASSWORD);
        loginPage.waitForHomePage();

        produtosPage.open();

        assertTrue(produtosPage.isProductCardVisible(TestData.PRODUCT_IN_STOCK_ID),
                "O produto em estoque deve estar visível na lista de produtos.");
    }

    @Test
    void deveAdicionarProdutoAoCarrinhoEFinalizarPedido() {
        loginPage.login(TestData.TEST_USER_EMAIL, TestData.TEST_USER_PASSWORD);
        loginPage.waitForHomePage();

        produtosPage.open();

        // Clica diretamente no botão usando JavaScript
        By addButton = By.cssSelector("[data-testid='add-to-cart-" + TestData.PRODUCT_IN_STOCK_ID + "']");
        JavascriptExecutor js = (JavascriptExecutor) driver;

        // Executa o clique via JavaScript para garantir que funciona
        js.executeScript("arguments[0].click();", driver.findElement(addButton));

        // Aguarda um momento para a ação completar
        try { Thread.sleep(2000); } catch (InterruptedException e) {}

        // Verifica localStorage
        Object cart = js.executeScript("return localStorage.getItem('campushop_cart');");
        System.out.println("Cart from localStorage: " + cart);

        // Verifica a notificação
        boolean hasNotification = !driver.findElements(By.cssSelector("[data-testid='product-notification']")).isEmpty();
        System.out.println("Has notification: " + hasNotification);

        assertTrue(produtosPage.isCartLinkVisible(), "O link do carrinho deve estar visível após adicionar produto.");

        produtosPage.openCart();
        carrinhoPage.waitForLoaded();

        assertTrue(carrinhoPage.isItemInCart(TestData.PRODUCT_IN_STOCK_ID),
                "O produto adicionado deve aparecer no carrinho.");
        assertEquals("R$ 0.10", carrinhoPage.getTotalText(),
                "O total do carrinho deve corresponder ao preço do produto.");

        // Verifica se o carrinho tem produtos antes de finalizar
        boolean hasItems = !driver.findElements(By.cssSelector("[data-testid^='cart-item-']")).isEmpty();
        System.out.println("Has items in cart: " + hasItems);

        if (hasItems) {
            carrinhoPage.finalizeOrder();
            // Aguarda um momento para a navegação
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        }
    }

    @Test
    void deveExibirBotaoForaDeEstoqueParaProdutoSemEstoque() {
        loginPage.login(TestData.TEST_USER_EMAIL, TestData.TEST_USER_PASSWORD);
        loginPage.waitForHomePage();

        produtosPage.open();

        Assumptions.assumeTrue(produtosPage.isProductCardVisible(TestData.PRODUCT_OUT_OF_STOCK_ID),
                "Produto sem estoque não está presente no ambiente de teste.");
        assertTrue(produtosPage.isProductOutOfStock(TestData.PRODUCT_OUT_OF_STOCK_ID),
                "O produto sem estoque deve exibir o botão 'Fora de estoque'.");
    }
}
