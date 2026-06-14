package service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.CarrinhoRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import br.com.campushop.campushop_backend.service.CarrinhoService;

@ExtendWith(MockitoExtension.class)
public class CarrinhoServiceTest {

    @Mock
    private CarrinhoRepository carrinhoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CarrinhoService service;

    @Test
    void deveCalcularTotalCorretamente() {
        Produto caneta = criarProduto(1, "Caneta", 2.50, 10);
        Produto caderno = criarProduto(2, "Caderno", 15.00, 5);

        Carrinho item1 = criarItemCarrinho(caneta, 3);
        Carrinho item2 = criarItemCarrinho(caderno, 1);

        when(carrinhoRepository.findByUsuarioId(1)).thenReturn(Arrays.asList(item1, item2));

        double total = service.calcularTotal(1);

        assertEquals(22.50, total, 0.001);
    }

    @Test
    void deveRetornarZero_QuandoCarrinhoVazio() {
        // Um carrinho vazio deve resultar em total zero, sem dependência de banco.
        when(carrinhoRepository.findByUsuarioId(1)).thenReturn(List.of());

        assertEquals(0.0, service.calcularTotal(1), 0.001);
    }

    @Test
    void deveNegarEstoque_QuandoQuantidadeMaior() {
        // A regra de estoque precisa barrar compras acima do saldo disponível.
        Produto produto = criarProduto(3, "Borracha", 5.00, 5);

        assertFalse(service.validarEstoque(produto, 10));
    }

    @Test
    void deveAceitarEstoque_QuandoQuantidadeDisponivel() {
        // Quantidade dentro do saldo deve ser aceita pela validação.
        Produto produto = criarProduto(4, "Lápis", 3.00, 8);

        assertTrue(service.validarEstoque(produto, 5));
    }

    @Test
    void deveBloquearCompraDoProprioProdutoAoAdicionarNoCarrinho() {
        // O vendedor não pode reservar o próprio produto no carrinho.
        Usuario vendedor = criarUsuario(10);
        Produto produto = criarProduto(5, "Mochila", 80.00, 4);
        produto.setUsuario(vendedor);

        // Não stubbamos service.validarEstoque(...) aqui porque service é @InjectMocks
        // (não é mock).
        // Este teste só precisa da exceção do 'produto pertence ao seu anúncio', então
        // vamos seguir apenas
        // com o mock do usuarioRepository e, para evitar possíveis NPEs na lógica
        // interna, ajustamos o
        // produtoRepository via reflection abaixo.

        // Como 'validarEstoque' não zera o acesso ao
        // produtoRepository.countByProdutoPai_IdProduto,
        // precisamos também deixar esse método retornar 0 via mock do repo.
        // Usamos reflection para obter o campo privado 'produtoRepository' do service.
        try {
            java.lang.reflect.Field f = br.com.campushop.campushop_backend.service.CarrinhoService.class
                    .getDeclaredField("produtoRepository");
            f.setAccessible(true);
            br.com.campushop.campushop_backend.repository.ProdutoRepository produtoRepositoryMock = org.mockito.Mockito
                    .mock(br.com.campushop.campushop_backend.repository.ProdutoRepository.class);
            // countByProdutoPai_IdProduto retorna long (vamos stubbear exatamente como
            // definido no repositório)
            // Intencionalmente sem stub: este teste valida a regra de que o produto
            // pertence ao mesmo anunciante.
            f.set(service, produtoRepositoryMock);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        IllegalArgumentException excecao = org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> service.adicionarAoCarrinho(10, produto, 1));

        assertEquals("Você não pode comprar este produto porque ele pertence ao seu anúncio", excecao.getMessage());
    }

    private Produto criarProduto(Integer id, String nome, Double preco, Integer estoque) {
        Produto produto = new Produto();
        produto.setIdProduto(id);
        produto.setNomeProduto(nome);
        produto.setPreco(preco);
        produto.setEstoque(estoque);
        return produto;
    }

    private Carrinho criarItemCarrinho(Produto produto, Integer quantidade) {
        Carrinho item = new Carrinho();
        item.setProduto(produto);
        item.setQuantidade(quantidade);
        return item;
    }

    private Usuario criarUsuario(Integer id) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNomeCompleto("Usuario " + id);
        return usuario;
    }

    // stubProdutoPaiCountIsZero removido: este teste não possui mock do
    // ProdutoRepository
    // e não deve referenciar any()/anyInt() sem import estável.

}
