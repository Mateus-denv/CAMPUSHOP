package br.com.campushop.campushop_backend.e2e.utils;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

/**
 * Factory para criar e gerenciar instâncias de WebDriver.
 * Suporta múltiplos navegadores e execução headless.
 * 
 * Boas práticas:
 * - Cada teste obtém uma nova instância isolada
 * - WebDriver é encerrado ao final de cada teste
 * - Suporte a execução headless para CI/CD
 */
public class DriverFactory {

    // Obtém o navegador configurado via variável de ambiente ou padrão
    public enum BrowserType {
        CHROME, FIREFOX
    }

    private static final String BROWSER_ENV = System.getenv("BROWSER") != null
            ? System.getenv("BROWSER").toUpperCase()
            : "CHROME";

    private static final String HEADLESS_MODE = System.getenv("HEADLESS") != null
            ? System.getenv("HEADLESS").toLowerCase()
            : "false";

    private static final String BASE_URL = System.getenv("BASE_URL") != null
            ? System.getenv("BASE_URL")
            : "http://localhost:5173";

    /**
     * Cria uma nova instância de WebDriver.
     * 
     * Variáveis de ambiente:
     * - BROWSER: CHROME (padrão) ou FIREFOX
     * - HEADLESS: true para execução headless
     * - BASE_URL: URL base da aplicação (http://localhost:5173)
     * 
     * @return WebDriver configurado
     */
    public static WebDriver createDriver() {
        BrowserType browser = getBrowserType();

        switch (browser) {
            case FIREFOX:
                return createFirefoxDriver();
            case CHROME:
            default:
                return createChromeDriver();
        }
    }

    /**
     * Cria e configura ChromeDriver.
     * Inclui configurações para melhorar stabilidade e performance de testes.
     */
    private static WebDriver createChromeDriver() {
        // WebDriverManager baixa e gerencia o ChromeDriver automaticamente
        String chromeVersion = System.getenv("CHROME_VERSION");
        WebDriverManager manager = WebDriverManager.chromedriver();
        if (chromeVersion != null && !chromeVersion.isBlank()) {
            manager.browserVersion(chromeVersion);
        }
        // Configura o WebDriverManager para evitar problemas de cache bloqueado
        manager.clearResolutionCache()
                .setup();

        ChromeOptions options = new ChromeOptions();

        // Configurações comuns
        options.addArguments(
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        // Modo headless se configurado
        if (isHeadlessMode()) {
            options.addArguments("--headless=new");
            options.addArguments("--window-size=1920,1080");
        } else {
            // Modo visual: maximiza a janela
            options.addArguments("--start-maximized");
        }

        // Desabilita notificações do browser
        options.addArguments("--disable-notifications");

        return new ChromeDriver(options);
    }

    /**
     * Cria e configura FirefoxDriver.
     */
    private static WebDriver createFirefoxDriver() {
        // WebDriverManager baixa e gerencia o GeckoDriver automaticamente
        WebDriverManager.firefoxdriver().setup();

        FirefoxOptions options = new FirefoxOptions();

        // Modo headless se configurado
        if (isHeadlessMode()) {
            options.addArguments("--headless");
            options.addArguments("--width=1920");
            options.addArguments("--height=1080");
        }

        return new FirefoxDriver(options);
    }

    /**
     * Encerra o WebDriver e libera recursos.
     * 
     * @param driver WebDriver a encerrar
     */
    public static void closeDriver(WebDriver driver) {
        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception e) {
                System.err.println("Erro ao encerrar WebDriver: " + e.getMessage());
            }
        }
    }

    /**
     * @return URL base da aplicação
     */
    public static String getBaseUrl() {
        return BASE_URL;
    }

    /**
     * @return true se headless mode está ativo
     */
    private static boolean isHeadlessMode() {
        return "true".equalsIgnoreCase(HEADLESS_MODE);
    }

    /**
     * @return tipo de navegador configurado
     */
    private static BrowserType getBrowserType() {
        try {
            return BrowserType.valueOf(BROWSER_ENV);
        } catch (IllegalArgumentException e) {
            System.out.println("Navegador " + BROWSER_ENV + " não suportado. Usando CHROME");
            return BrowserType.CHROME;
        }
    }

    /**
     * Aguarda a página carregar completamente.
     * Útil após navegações para garantir que o DOM está pronto.
     * 
     * @param driver WebDriver
     */
    public static void waitForPageLoad(WebDriver driver) {
        org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver,
                java.time.Duration.ofSeconds(10));

        wait.until(webDriver -> ((org.openqa.selenium.JavascriptExecutor) webDriver)
                .executeScript("return document.readyState").equals("complete"));
    }
}
