package br.com.campushop.campushop_backend.e2e.pages;

/**
 * pagina de produtos.
 * tem metodos para abrir a lista de produtos, adicionar ao carrinho e ver detalhes.
 */

import br.com.campushop.campushop_backend.e2e.utils.DriverFactory;
import br.com.campushop.campushop_backend.e2e.utils.TestData;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ProdutosPage {

    // driver e o navegador que o selenium controla
    private final WebDriver driver;

    // wait e usado para esperar elementos aparecerem na tela
    private final WebDriverWait wait;

    // seletores: localizam os elementos na pagina pelo atributo data-testid
    // cart-link e o icone do carrinho que aparece no header
    private final By cartLink = By.cssSelector("[data-testid='cart-link']");

    // product-card-{id} e o card de cada produto na lista
    private final By productCardSelector = By.cssSelector("[data-testid^='product-card-']");

    // nome do produto que aparece no card
    private final By productName = By.cssSelector("h3.text-xl.font-bold");

    /**
     * construtor.
     * recebe o driver e cria o wait com timeout de 10 segundos.
     */
    public ProdutosPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(TestData.DEFAULT_TIMEOUT));
    }

    /**
     * abre a pagina de produtos.
     * vai para a url de produtos e espera a pagina carregar.
     */
    public void open() {
        // abre a pagina de produtos
        driver.get(TestData.getProdutosUrl());

        // espera a pagina carregar completamente
        DriverFactory.waitForPageLoad(driver);

        // espera o link do carrinho aparecer (indica que a pagina carregou)
        wait.until(ExpectedConditions.visibilityOfElementLocated(cartLink));
    }

    /**
     * verifica se um produto esta visivel na lista.
     *
     * @param productId id do produto
     * @return true se o card do produto esta na tela
     */
    public boolean isProductCardVisible(int productId) {
        // procura o card do produto pelo seletor data-testid
        // o seletor e algo como [data-testid='product-card-1']
        By card = By.cssSelector("[data-testid='product-card-" + productId + "']");
        return !driver.findElements(card).isEmpty();
    }

    /**
     * verifica se o link do carrinho esta visivel.
     * isso indica que o usuario esta logado e pode ver o carrinho.
     *
     * @return true se o link do carrinho esta na tela
     */
    public boolean isCartLinkVisible() {
        return !driver.findElements(cartLink).isEmpty();
    }

    /**
     * adiciona um produto ao carrinho.
     * clica no botao de adicionar ao carrinho.
     *
     * @param productId id do produto para adicionar
     */
    public void addProductToCart(int productId) {
        // monta o seletor do botao de adicionar carrinho
        // o seletor e algo como [data-testid='add-to-cart-1']
        By addButton = By.cssSelector("[data-testid='add-to-cart-" + productId + "']");

        // espera o botao estar clicavel e clica
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(addButton));
        button.click();

        // espera um pouco para a notificacao aparecer
        try {
            wait.until(ExpectedConditions
                    .visibilityOfElementLocated(By.cssSelector("[data-testid='product-notification']")));
        } catch (Exception e) {
            // se nao encontrar notificacao, apenas espera a api responder
            wait.withTimeout(Duration.ofSeconds(2));
        }
    }

    /**
     * verifica se um produto esta fora de estoque.
     *
     * @param productId id do produto
     * @return true se o botao do produto mostrar "fora de estoque"
     */
    public boolean isProductOutOfStock(int productId) {
        // monta o seletor do botao de adicionar carrinho
        By addButton = By.cssSelector("[data-testid='add-to-cart-" + productId + "']");

        // espera o botao aparecer na tela
        WebElement button = wait.until(ExpectedConditions.visibilityOfElementLocated(addButton));

        // verifica se o texto do botao contem "fora de estoque"
        return button.getText().contains("fora de estoque");
    }

    /**
     * abre a pagina do carrinho.
     * vai direto para a url do carrinho em vez de clicar no link.
     * isso evita problemas quando o link nao esta clicavel.
     */
    public void openCart() {
        driver.get(TestData.getCarrinhoUrl());
        DriverFactory.waitForPageLoad(driver);
    }

    /**
     * pega a quantidade de itens no carrinho.
     * le o texto do link do carrinho (exemplo: "carrinho (3)")
     *
     * @return numero de itens no carrinho
     */
    public int getCartQuantity() {
        // pega o texto do link do carrinho
        String texto = driver.findElement(cartLink).getText();

        // extrai o numero do parenteses
        // ex: "carrinho (3)" -> "3"
        String numero = texto.replaceAll(".*\\((\\d+)\\).*", "$1");

        return Integer.parseInt(numero);
    }
}