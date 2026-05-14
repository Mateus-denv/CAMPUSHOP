package br.com.campushop.campushop_backend.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyInt;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.CarrinhoRepository;

@ExtendWith(MockitoExtension.class)
class CarrinhoServiceTest {

    @Mock
    private CarrinhoRepository carrinhoRepository;

    @InjectMocks
    private CarrinhoService carrinhoService;

    @Test
    void calcularTotal_comMultiplosItens_retornaSomaCorreta() {
        Produto produtoA = criarProduto(1, 10.0, 5);
        Produto produtoB = criarProduto(2, 2.5, 10);

        Carrinho itemA = new Carrinho(null, produtoA, 2);
        Carrinho itemB = new Carrinho(null, produtoB, 3);

        when(carrinhoRepository.findByUsuarioId(anyInt())).thenReturn(List.of(itemA, itemB));

        Double total = carrinhoService.calcularTotal(42);

        assertEquals(10.0 * 2 + 2.5 * 3, total, 0.0001, "Total deve somar corretamente vários itens");
    }

    @Test
    void calcularTotal_comListaVazia_retornaZero() {
        when(carrinhoRepository.findByUsuarioId(anyInt())).thenReturn(List.of());

        Double total = carrinhoService.calcularTotal(42);

        assertEquals(0.0, total, 0.0001, "Total com lista vazia deve ser zero");
    }

    @Test
    void calcularTotal_comItemComPrecoNulo_disparaNullPointerException() {
        Produto produtoInvalido = criarProduto(1, null, 5);
        Carrinho item = new Carrinho(null, produtoInvalido, 1);

        when(carrinhoRepository.findByUsuarioId(anyInt())).thenReturn(List.of(item));

        Throwable exception = assertThrows(NullPointerException.class, () -> carrinhoService.calcularTotal(42));
        assertEquals(NullPointerException.class, exception.getClass(),
                "Produto sem preço deve causar NullPointerException no cálculo atual");
    }

    @Test
    void validarEstoque_comEstoqueSuficiente_retornaTrue() {
        Produto produto = criarProduto(1, 20.0, 10);

        assertTrue(carrinhoService.validarEstoque(produto, 5), "Estoque suficiente deve retornar true");
    }

    @Test
    void validarEstoque_comEstoqueInsuficiente_retornaFalse() {
        Produto produto = criarProduto(1, 20.0, 3);

        assertFalse(carrinhoService.validarEstoque(produto, 5), "Estoque insuficiente deve retornar false");
    }

    @Test
    void validarEstoque_comProdutoNulo_retornaFalse() {
        assertFalse(carrinhoService.validarEstoque(null, 1), "Produto nulo deve retornar false");
    }

    private Produto criarProduto(Integer id, Double preco, Integer estoque) {
        Produto produto = new Produto();
        produto.setIdProduto(id);
        produto.setPreco(preco);
        produto.setEstoque(estoque);
        return produto;
    }
}
