package br.com.campushop.campushop_backend.e2e.pages;

/**
 * pagina do carrinho.
 * tem metodos para ver itens, total, finalizar pedido e ver mensagem de sucesso.
 */

import br.com.campushop.campushop_backend.e2e.utils.DriverFactory;
import br.com.campushop.campushop_backend.e2e.utils.TestData;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class CarrinhoPage {

    // driver e o navegador que o selenium controla
    private final WebDriver driver;

    // wait e usado para esperar elementos aparecerem na tela
    // usa timeout longo (20 segundos) porque a pagina pode demorar para carregar
    private final WebDriverWait wait;

    // seletores: localizam os elementos na pagina pelo atributo data-testid
    // finalizaPedidoButton e o botao para finalizar a compra
    private final By finalizaPedidoButton = By.cssSelector("[data-testid='cart-finalize-button']");

    // successMessage e a mensagem que aparece depois de finalizar
    private final By successMessage = By.cssSelector("[data-testid='cart-success-message']");

    // cartTotal e o texto que mostra o valor total do carrinho
    private final By cartTotal = By.cssSelector("[data-testid='cart-total']");

    /**
     * construtor.
     * recebe o driver e cria o wait com timeout de 20 segundos.
     */
    public CarrinhoPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(TestData.LONG_TIMEOUT));
    }

    /**
     * espera a pagina do carrinho carregar.
     * verifica se algum dos elementos principais apareceu:
     * - botao de finalizar pedido (se tiver itens)
     * - mensagem de carrinho vazio (se nao tiver itens)
     * - algum item no carrinho
     */
    public void waitForLoaded() {
        // espera a pagina carregar completamente
        DriverFactory.waitForPageLoad(driver);

        // espera ate 20 segundos para qualquer um dos elementos aparecerem
        try {
            wait.until(ExpectedConditions.or(
                    // botao de finalizar pedido aparece se tiver itens
                    ExpectedConditions.visibilityOfElementLocated(finalizaPedidoButton),
                    // mensagem de carrinho vazio aparece se nao tiver itens
                    ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='cart-empty-message']")),
                    // item no carrinho aparece se tiver itens
                    ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid^='cart-item-']"))
            ));
        } catch (Exception e) {
            // se deu erro, imprime informacoes para debug
            // isso ajuda a entender o que aconteceu quando o teste falha
            String urlAtual = driver.getCurrentUrl();
            String htmlPagina = driver.getPageSource();
            System.out.println("url atual: " + urlAtual);
            System.out.println("tem 'cart-finalize-button': " + htmlPagina.contains("cart-finalize-button"));
            System.out.println("tem 'cart-empty-message': " + htmlPagina.contains("cart-empty-message"));
            System.out.println("tem 'cart-item-': " + htmlPagina.contains("cart-item-"));

            // relanca o erro para o teste mostrar que falhou
            throw e;
        }
    }

    /**
     * verifica se um item esta no carrinho.
     *
     * @param productId id do produto
     * @return true se o item aparece no carrinho
     */
    public boolean isItemInCart(int productId) {
        // monta o seletor do item no carrinho
        // o seletor e algo como [data-testid='cart-item-1']
        By item = By.cssSelector("[data-testid='cart-item-" + productId + "']");
        return !driver.findElements(item).isEmpty();
    }

    /**
     * pega o texto do total do carrinho.
     * o texto e algo como "r$ 0.10" ou "total: r$ 15.00"
     *
     * @return texto do total
     */
    public String getTotalText() {
        // espera o elemento do total aparecer e pega o texto
        return wait.until(ExpectedConditions.visibilityOfElementLocated(cartTotal)).getText();
    }

    /**
     * clica no botao de finalizar pedido.
     * isso envia o pedido e redireciona para a pagina de confirmacao.
     */
    public void finalizeOrder() {
        // espera o botao estar clicavel e clica
        wait.until(ExpectedConditions.elementToBeClickable(finalizaPedidoButton)).click();
    }

    /**
     * pega a mensagem de sucesso apos finalizar o pedido.
     *
     * @return texto da mensagem de sucesso
     */
    public String getSuccessMessage() {
        // espera a mensagem de sucesso aparecer
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successMessage)).getText();
    }
}