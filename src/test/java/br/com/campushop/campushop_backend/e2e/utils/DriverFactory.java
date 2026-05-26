package br.com.campushop.campushop_backend.e2e.utils;

/**
 * factory para criar e gerenciar o navegador.
 * cada teste recebe um navegador novo e limpo.
 *
 * suporta chrome e firefox.
 * suporta modo headless (sem abrir janela).
 *
 * configuracao via variaveis de ambiente:
 * - browser: chrome ou firefox (padrao: chrome)
 * - headless: true ou false (padrao: false)
 * - base_url: url do frontend (padrao: http://localhost:5173)
 */

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

public class DriverFactory {

    // tipo de navegador que pode ser usado
    public enum BrowserType {
        CHROME, FIREFOX
    }

    // pega o navegador da variavel de ambiente ou usa chrome como padrao
    private static final String BROWSER_ENV = System.getenv("browser") != null
            ? System.getenv("browser").toUpperCase()
            : "chrome";

    // pega o modo headless da variavel de ambiente ou usa false como padrao
    private static final String HEADLESS_MODE = System.getenv("headless") != null
            ? System.getenv("headless").toLowerCase()
            : "false";

    // pega a url base da variavel de ambiente ou usa a padrao
    private static final String BASE_URL = System.getenv("base_url") != null
            ? System.getenv("base_url")
            : "http://localhost:5173";

    /**
     * cria um navegador novo.
     * escolhe entre chrome ou firefox dependendo da configuracao.
     *
     * @return navegador configurado
     */
    public static WebDriver createDriver() {
        // ve qual tipo de navegador usar
        BrowserType navegador = getBrowserType();

        // cria o navegador apropriado
        switch (navegador) {
            case FIREFOX:
                return createFirefoxDriver();
            case CHROME:
            default:
                return createChromeDriver();
        }
    }

    /**
     * cria e configura o chrome.
     * usa o webdrivermanager para baixar o driver automaticamente.
     */
    private static WebDriver createChromeDriver() {
        // webdrivermanager baixa e gerencia o chromedriver automaticamente
        // isso evita ter que baixar o driver manualmente
        String chromeVersion = System.getenv("chrome_version");
        WebDriverManager manager = WebDriverManager.chromedriver();

        // se tiver versao do chrome configurada, usa ela
        if (chromeVersion != null && !chromeVersion.isBlank()) {
            manager.browserVersion(chromeVersion);
        }

        // limpa o cache de resolucao para evitar problemas
        manager.clearResolutionCache()
                .setup();

        // configura as opcoes do chrome
        ChromeOptions options = new ChromeOptions();

        // configuracoes para melhorar a compatibilidade
        options.addArguments(
                "--no-sandbox",  // necessario no linux/docker
                "--disable-dev-shm-usage",  // evita problemas de memoria
                "--disable-blink-features=AutomationControlled",  // disfarca como navegador normal
                "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        // se for modo headless, nao abre a janela do navegador
        if (isHeadlessMode()) {
            options.addArguments("--headless=new");
            options.addArguments("--window-size=1920,1080");
        } else {
            // se nao for headless, maximiza a janela
            options.addArguments("--start-maximized");
        }

        // desabilita as notificacoes do navegador
        options.addArguments("--disable-notifications");

        return new ChromeDriver(options);
    }

    /**
     * cria e configura o firefox.
     * usa o webdrivermanager para baixar o driver automaticamente.
     */
    private static WebDriver createFirefoxDriver() {
        // webdrivermanager baixa e gerencia o geckodriver automaticamente
        WebDriverManager.firefoxdriver().setup();

        // configura as opcoes do firefox
        FirefoxOptions options = new FirefoxOptions();

        // se for modo headless, nao abre a janela do navegador
        if (isHeadlessMode()) {
            options.addArguments("--headless");
            options.addArguments("--width=1920");
            options.addArguments("--height=1080");
        }

        return new FirefoxDriver(options);
    }

    /**
     * fecha o navegador e libera memoria.
     * deve ser chamado no final de cada teste.
     *
     * @param driver navegador a fechar
     */
    public static void closeDriver(WebDriver driver) {
        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception e) {
                System.err.println("erro ao fechar o navegador: " + e.getMessage());
            }
        }
    }

    /**
     * retorna a url base da aplicacao.
     *
     * @return url base (ex: http://localhost:5173)
     */
    public static String getBaseUrl() {
        return BASE_URL;
    }

    /**
     * verifica se o modo headless esta ativo.
     *
     * @return true se headless mode esta ativo
     */
    private static boolean isHeadlessMode() {
        return "true".equalsIgnoreCase(HEADLESS_MODE);
    }

    /**
     * retorna o tipo de navegador configurado.
     *
     * @return tipo do navegador (chrome ou firefox)
     */
    private static BrowserType getBrowserType() {
        try {
            return BrowserType.valueOf(BROWSER_ENV);
        } catch (IllegalArgumentException e) {
            System.out.println("navegador " + BROWSER_ENV + " nao suportado. usando chrome");
            return BrowserType.CHROME;
        }
    }

    /**
     * espera a pagina carregar completamente.
     * usa javascript para verificar se o documento esta pronto.
     *
     * @param driver navegador
     */
    public static void waitForPageLoad(WebDriver driver) {
        org.openqa.selenium.support.ui.WebDriverWait wait =
            new org.openqa.selenium.support.ui.WebDriverWait(driver,
                java.time.Duration.ofSeconds(10));

        // executa um script que verifica se a pagina carregou
        // so continua quando o document.readystate for "complete"
        wait.until(webDriver -> ((org.openqa.selenium.JavascriptExecutor) webDriver)
                .executeScript("return document.readyState").equals("complete"));
    }
}