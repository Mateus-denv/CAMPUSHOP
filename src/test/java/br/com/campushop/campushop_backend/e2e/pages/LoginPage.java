package br.com.campushop.campushop_backend.e2e.pages;

import br.com.campushop.campushop_backend.e2e.utils.DriverFactory;
import br.com.campushop.campushop_backend.e2e.utils.TestData;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final By emailInput = By.cssSelector("[data-testid='login-email']");
    private final By passwordInput = By.cssSelector("[data-testid='login-password']");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By loginError = By.cssSelector("[data-testid='login-error']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(TestData.DEFAULT_TIMEOUT));
    }

    public void open() {
        driver.get(TestData.getLoginUrl());
        DriverFactory.waitForPageLoad(driver);
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
    }

    public void login(String email, String password) {
        open();
        driver.findElement(emailInput).clear();
        driver.findElement(emailInput).sendKeys(email);
        driver.findElement(passwordInput).clear();
        driver.findElement(passwordInput).sendKeys(password);
        driver.findElement(submitButton).click();

        // Aguarda redirecionamento ou mensagem de erro de login
        wait.until(webDriver -> {
            String currentUrl = webDriver.getCurrentUrl();
            boolean redirected = currentUrl.contains("/home") || currentUrl.contains("/produtos");
            boolean hasLoginError = !webDriver.findElements(loginError).isEmpty();
            return redirected || hasLoginError;
        });

        if (!driver.getCurrentUrl().contains("/home") && !driver.getCurrentUrl().contains("/produtos")) {
            String errorMessage = driver.findElement(loginError).getText();
            throw new IllegalStateException("Falha no login: " + errorMessage);
        }
    }

    public void waitForHomePage() {
        wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/home"),
                ExpectedConditions.urlContains("/produtos")));
    }
}
