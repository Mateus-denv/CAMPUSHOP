package br.com.campushop.campushop_backend.e2e.pages;

import br.com.campushop.campushop_backend.e2e.utils.DriverFactory;
import br.com.campushop.campushop_backend.e2e.utils.TestData;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class CarrinhoPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final By finalizaPedidoButton = By.cssSelector("[data-testid='cart-finalize-button']");
    private final By successMessage = By.cssSelector("[data-testid='cart-success-message']");
    private final By cartTotal = By.cssSelector("[data-testid='cart-total']");

    public CarrinhoPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(TestData.LONG_TIMEOUT));
    }

    public void waitForLoaded() {
        // Aguarda a página carregar completamente
        DriverFactory.waitForPageLoad(driver);
        // Espera até 20 segundos para qualquer um dos elementos aparecerem
        try {
            wait.until(ExpectedConditions.or(
                    ExpectedConditions.visibilityOfElementLocated(finalizaPedidoButton),
                    ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='cart-empty-message']")),
                    ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid^='cart-item-']"))
            ));
        } catch (Exception e) {
            // Debug: imprime a URL atual e o HTML da página
            String currentUrl = driver.getCurrentUrl();
            String pageSource = driver.getPageSource();
            System.out.println("Current URL: " + currentUrl);
            System.out.println("Page contains 'cart-finalize-button': " + pageSource.contains("cart-finalize-button"));
            System.out.println("Page contains 'cart-empty-message': " + pageSource.contains("cart-empty-message"));
            System.out.println("Page contains 'cart-item-': " + pageSource.contains("cart-item-"));
            throw e;
        }
    }

    public boolean isItemInCart(int productId) {
        return !driver.findElements(By.cssSelector("[data-testid='cart-item-" + productId + "']")).isEmpty();
    }

    public String getTotalText() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(cartTotal)).getText();
    }

    public void finalizeOrder() {
        wait.until(ExpectedConditions.elementToBeClickable(finalizaPedidoButton)).click();
    }

    public String getSuccessMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successMessage)).getText();
    }
}
