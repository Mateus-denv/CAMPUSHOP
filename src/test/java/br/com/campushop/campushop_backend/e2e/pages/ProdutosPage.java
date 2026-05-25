package br.com.campushop.campushop_backend.e2e.pages;

import br.com.campushop.campushop_backend.e2e.utils.DriverFactory;
import br.com.campushop.campushop_backend.e2e.utils.TestData;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ProdutosPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final By cartLink = By.cssSelector("[data-testid='cart-link']");
    private final By productCardSelector = By.cssSelector("[data-testid^='product-card-']");
    private final By productName = By.cssSelector("h3.text-xl.font-bold");

    public ProdutosPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(TestData.DEFAULT_TIMEOUT));
    }

    public void open() {
        driver.get(TestData.getProdutosUrl());
        DriverFactory.waitForPageLoad(driver);
        wait.until(ExpectedConditions.visibilityOfElementLocated(cartLink));
    }

    public boolean isProductCardVisible(int productId) {
        return !driver.findElements(By.cssSelector("[data-testid='product-card-" + productId + "']")).isEmpty();
    }

    public boolean isCartLinkVisible() {
        return !driver.findElements(cartLink).isEmpty();
    }

    public void addProductToCart(int productId) {
        By addButton = By.cssSelector("[data-testid='add-to-cart-" + productId + "']");
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(addButton));
        button.click();
        // Aguarda um pouco para a notificação aparecer
        try {
            wait.until(ExpectedConditions
                    .visibilityOfElementLocated(By.cssSelector("[data-testid='product-notification']")));
        } catch (Exception e) {
            // Se não encontrar notificação, apenas aguarda a API responder
            wait.withTimeout(Duration.ofSeconds(2));
        }
    }

    public boolean isProductOutOfStock(int productId) {
        By addButton = By.cssSelector("[data-testid='add-to-cart-" + productId + "']");
        WebElement button = wait.until(ExpectedConditions.visibilityOfElementLocated(addButton));
        return button.getText().contains("Fora de estoque");
    }

    public void openCart() {
        driver.get(TestData.getCarrinhoUrl());
        DriverFactory.waitForPageLoad(driver);
    }

    public int getCartQuantity() {
        String text = driver.findElement(cartLink).getText();
        String number = text.replaceAll(".*\\((\\d+)\\).*", "$1");
        return Integer.parseInt(number);
    }
}
