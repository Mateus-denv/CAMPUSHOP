package br.com.campushop.campushop_backend.e2e.utils;

/**
 * centralizador de dados para os testes e2e.
 * aqui ficam todas as constantes que os testes usam.
 *
 * o que tem aqui:
 * - emails e senhas dos usuarios de teste
 * - ids e precos dos produtos de teste
 * - urls das paginas
 * - timeouts
 * - mensagens de erro
 *
 * importante: os dados aqui devem existir no banco de verdade.
 * veja o arquivo db/scripts/002_seed.sql para ver o que e criado.
 */

public class TestData {

    // =====================================================
    // dados do usuario de teste (comprador)
    // =====================================================

    /** email do usuario de teste (comprador) */
    public static final String TEST_USER_EMAIL = "maria@campushop.com";

    /** senha do usuario de teste */
    public static final String TEST_USER_PASSWORD = "password";

    /** nome completo do usuario de teste */
    public static final String TEST_USER_NAME = "maria souza";

    // =====================================================
    // dados do segundo usuario de teste (vendedor)
    // =====================================================

    /** email do segundo usuario de teste */
    public static final String TEST_USER_2_EMAIL = "joao@campushop.com";

    /** senha do segundo usuario de teste */
    public static final String TEST_USER_2_PASSWORD = "password";

    /** nome completo do segundo usuario de teste */
    public static final String TEST_USER_2_NAME = "joao lima";

    // =====================================================
    // dados do produto em estoque (para testar adicionar ao carrinho)
    // =====================================================

    /** id do produto que tem no estoque */
    public static final int PRODUCT_IN_STOCK_ID = 1;

    /** nome do produto que tem no estoque */
    public static final String PRODUCT_IN_STOCK_NAME = "arthur";

    /** preco do produto que tem no estoque */
    public static final double PRODUCT_IN_STOCK_PRICE = 0.10;

    // =====================================================
    // dados do produto sem estoque (para testar botao "fora de estoque")
    // =====================================================

    /** id do produto sem estoque */
    public static final int PRODUCT_OUT_OF_STOCK_ID = 999;

    /** nome do produto sem estoque */
    public static final String PRODUCT_OUT_OF_STOCK_NAME = "produto sem estoque";

    // =====================================================
    // dados do segundo produto em estoque (para testar multiplos itens)
    // =====================================================

    /** id do segundo produto em estoque */
    public static final int PRODUCT_2_IN_STOCK_ID = 2;

    /** nome do segundo produto em estoque */
    public static final String PRODUCT_2_IN_STOCK_NAME = "empada";

    /** preco do segundo produto em estoque */
    public static final double PRODUCT_2_IN_STOCK_PRICE = 3.00;

    // =====================================================
    // dados para checkout (ainda nao usado nos testes)
    // =====================================================

    /** endereco falso para testar checkout */
    public static final String TEST_ADDRESS = "rua do teste, 123 - apt 456";

    /** telefone falso para testar checkout */
    public static final String TEST_PHONE = "11987654321";

    // =====================================================
    // timeouts (em segundos)
    // =====================================================

    /** timeout padrao para esperar elementos aparecerem */
    public static final int DEFAULT_TIMEOUT = 10;

    /** timeout curto para acoes rapidas */
    public static final int SHORT_TIMEOUT = 3;

    /** timeout longo para operacoes que demoram mais */
    public static final int LONG_TIMEOUT = 20;

    // =====================================================
    // urls das paginas
    // =====================================================

    /** monta a url da pagina home */
    public static String getHomeUrl() {
        return driverfactory.getbaseurl() + "/home";
    }

    /** monta a url da pagina de login */
    public static String getLoginUrl() {
        return driverfactory.getbaseurl() + "/login";
    }

    /** monta a url da pagina de produtos */
    public static String getProdutosUrl() {
        return driverfactory.getbaseurl() + "/produtos";
    }

    /** monta a url da pagina do carrinho */
    public static String getCarrinhoUrl() {
        return driverfactory.getbaseurl() + "/carrinho";
    }

    /** monta a url da pagina de detalhes de um produto */
    public static String getProductDetailUrl(int productId) {
        return driverfactory.getbaseurl() + "/produto/" + productId;
    }

    // =====================================================
    // mensagens de validacao (para comparar com o que aparece na tela)
    // =====================================================

    /** mensagem que aparece quando a senha esta errada */
    public static final String INVALID_LOGIN_MESSAGE = "senha incorreta";

    /** mensagem que aparece quando o usuario nao existe */
    public static final String USER_NOT_FOUND_MESSAGE = "usuario nao existe";

    /** mensagem que aparece no botao quando o produto nao tem estoque */
    public static final String PRODUCT_OUT_OF_STOCK_MESSAGE = "fora de estoque";

    /** mensagem da notificacao quando produto e adicionado ao carrinho */
    public static final String PRODUCT_ADDED_TO_CART_MESSAGE = "produto adicionado ao carrinho";
}