package br.com.campushop.campushop_backend.e2e.pages;

/**
 * pagina de login.
 * tem metodos para abrir a pagina, fazer login e verificar se deu certo.
 */

import br.com.campushop.campushop_backend.e2e.utils.DriverFactory;
import br.com.campushop.campushop_backend.e2e.utils.TestData;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {

    // driver e o navegador que o selenium controla
    private final WebDriver driver;

    // wait e usado para esperar elementos aparecerem na tela
    private final WebDriverWait wait;

    // seletores: localizam os elementos na pagina pelo atributo data-testid
    // esses seletores devem existir no html do frontend
    private final By emailInput = By.cssSelector("[data-testid='login-email']");
    private final By passwordInput = By.cssSelector("[data-testid='login-password']");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By loginError = By.cssSelector("[data-testid='login-error']");

    /**
     * construtor.
     * recebe o driver e cria o wait com timeout de 10 segundos.
     */
    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(TestData.DEFAULT_TIMEOUT));
    }

    /**
     * abre a pagina de login.
     * vai para a url de login e espera a pagina carregar.
     */
    public void open() {
        // abre a pagina de login
        driver.get(TestData.getLoginUrl());

        // espera a pagina carregar completamente
        DriverFactory.waitForPageLoad(driver);

        // espera o campo de email aparecer
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
    }

    /**
     * faz o login.
     * digita email e senha nos campos e clica no botao de login.
     *
     * @param email email do usuario
     * @param password senha do usuario
     */
    public void login(String email, String password) {
        // abre a pagina de login
        open();

        // limpa o campo de email e digita o email
        driver.findElement(emailInput).clear();
        driver.findElement(emailInput).sendKeys(email);

        // limpa o campo de senha e digita a senha
        driver.findElement(passwordInput).clear();
        driver.findElement(passwordInput).sendKeys(password);

        // clica no botao de login
        driver.findElement(submitButton).click();

        // espera o redirecionamento ou mensagem de erro
        // o teste passa se for redirecionado para /home ou /produtos
        // o teste falha se aparecer a mensagem de erro de login
        wait.until(webDriver -> {
            String urlAtual = webDriver.getCurrentUrl();
            boolean redirecionado = urlAtual.contains("/home") || urlAtual.contains("/produtos");
            boolean temErroLogin = !webDriver.findElements(loginError).isEmpty();
            return redirecionado || temErroLogin;
        });

        // verifica se foi redirecionado com sucesso
        // se nao foi, pega a mensagem de erro e lancar um erro
        if (!driver.getCurrentUrl().contains("/home") && !driver.getCurrentUrl().contains("/produtos")) {
            String mensagemErro = driver.findElement(loginError).getText();
            throw new IllegalStateException("falha no login: " + mensagemErro);
        }
    }

    /**
     * espera a pagina de home aparecer.
     * verifica se a url contem /home ou /produtos.
     */
    public void waitForHomePage() {
        wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/home"),
                ExpectedConditions.urlContains("/produtos")));
    }
}