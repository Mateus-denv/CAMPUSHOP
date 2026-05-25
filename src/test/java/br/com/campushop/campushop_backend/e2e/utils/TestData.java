package br.com.campushop.campushop_backend.e2e.utils;

/**
 * Centralizador de dados para testes E2E.
 * Mantém credenciais, IDs de produtos e URLs consistentes.
 * 
 * Esses dados devem ser cadastrados no banco antes de rodar os testes.
 * Veja: db/scripts/002_seed.sql
 */
public class TestData {

    // =====================================================
    // Credenciais de Teste
    // =====================================================

    /** Usuário de teste válido - DEVE existir no banco */
    public static final String TEST_USER_EMAIL = "maria@campushop.com";
    public static final String TEST_USER_PASSWORD = "password";
    public static final String TEST_USER_NAME = "Maria Souza";

    /** Usuário segundo para testes multi-user */
    public static final String TEST_USER_2_EMAIL = "joao@campushop.com";
    public static final String TEST_USER_2_PASSWORD = "password";
    public static final String TEST_USER_2_NAME = "Joao Lima";

    // =====================================================
    // IDs de Produtos para Teste
    // =====================================================

    /** Produto EM ESTOQUE - com quantidade suficiente */
    public static final int PRODUCT_IN_STOCK_ID = 1;
    public static final String PRODUCT_IN_STOCK_NAME = "Arthur";
    public static final double PRODUCT_IN_STOCK_PRICE = 0.10;

    /** Produto SEM ESTOQUE - deve estar com estoque = 0 */
    public static final int PRODUCT_OUT_OF_STOCK_ID = 999;
    public static final String PRODUCT_OUT_OF_STOCK_NAME = "Produto sem estoque";

    /** Segundo produto para testes de múltiplos itens */
    public static final int PRODUCT_2_IN_STOCK_ID = 2;
    public static final String PRODUCT_2_IN_STOCK_NAME = "empada";
    public static final double PRODUCT_2_IN_STOCK_PRICE = 3.00;

    // =====================================================
    // Dados de Checkout/Compra
    // =====================================================

    /** Endereço de teste para checkout */
    public static final String TEST_ADDRESS = "Rua do Teste, 123 - Apt 456";

    /** Telefone de teste para checkout */
    public static final String TEST_PHONE = "11987654321";

    // =====================================================
    // Timeouts (em segundos)
    // =====================================================

    /** Timeout padrão para elementos aparecerem */
    public static final int DEFAULT_TIMEOUT = 10;

    /** Timeout curto para ações rápidas */
    public static final int SHORT_TIMEOUT = 3;

    /** Timeout longo para operações assíncronas */
    public static final int LONG_TIMEOUT = 20;

    // =====================================================
    // URLs
    // =====================================================

    public static String getHomeUrl() {
        return DriverFactory.getBaseUrl() + "/home";
    }

    public static String getLoginUrl() {
        return DriverFactory.getBaseUrl() + "/login";
    }

    public static String getProdutosUrl() {
        return DriverFactory.getBaseUrl() + "/produtos";
    }

    public static String getCarrinhoUrl() {
        return DriverFactory.getBaseUrl() + "/carrinho";
    }

    public static String getProductDetailUrl(int productId) {
        return DriverFactory.getBaseUrl() + "/produto/" + productId;
    }

    // =====================================================
    // Mensagens de Validação
    // =====================================================

    public static final String INVALID_LOGIN_MESSAGE = "Senha incorreta";
    public static final String USER_NOT_FOUND_MESSAGE = "Usuário não existe";
    public static final String PRODUCT_OUT_OF_STOCK_MESSAGE = "Fora de estoque";
    public static final String PRODUCT_ADDED_TO_CART_MESSAGE = "Produto adicionado ao carrinho";
}
