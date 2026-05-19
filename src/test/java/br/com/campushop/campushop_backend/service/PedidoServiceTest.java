package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.PedidoItemRequest;
import br.com.campushop.campushop_backend.dto.PedidoRequest;
import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CarrinhoService carrinhoService;

    @InjectMocks
    private PedidoService pedidoService;

    private Usuario usuario;
    private Produto produtoA;
    private Produto produtoB;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNomeCompleto("Aluno Teste");
        usuario.setEmail("aluno@teste.com");

        produtoA = criarProduto(10, "Caderno", 10.0, 5);
        produtoB = criarProduto(11, "Caneta", 4.0, 2);

        lenient().when(produtoRepository.save((Produto) any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(pedidoRepository.save((Pedido) any())).thenAnswer(invocation -> {
            Pedido pedido = invocation.getArgument(0);
            if (pedido.getIdPedido() == null) {
                pedido.setIdPedido(99);
            }
            return pedido;
        });
    }

    @Test
    void deveCriarPedidoDoCarrinhoEReservarEstoque() {
        Carrinho itemA = criarCarrinho(produtoA, 2);
        Carrinho itemB = criarCarrinho(produtoB, 1);
        when(carrinhoService.listarPorUsuario(1)).thenReturn(List.of(itemA, itemB));
        when(carrinhoService.validarEstoque(produtoA, 2)).thenReturn(true);
        when(carrinhoService.validarEstoque(produtoB, 1)).thenReturn(true);

        Pedido pedido = pedidoService.criarPedido(usuario, null);

        assertEquals(99, pedido.getIdPedido());
        assertEquals("PENDENTE", pedido.getStatus());
        assertEquals(24.0, pedido.getTotal());
        assertEquals(2, pedido.getItens().size());
        assertEquals(3, produtoA.getEstoque());
        assertEquals(1, produtoB.getEstoque());
        verify(carrinhoService).limparCarrinho(1);
    }

    @Test
    void deveCancelarPedidoERestituirEstoque() {
        produtoA.setEstoque(3);
        produtoB.setEstoque(1);
        Pedido pedido = criarPedidoExistente(7, usuario, produtoA, 2, produtoB, 1);
        when(pedidoRepository.findByIdPedidoAndUsuarioId(7, 1)).thenReturn(Optional.of(pedido));

        Pedido cancelado = pedidoService.cancelarPedido(7, usuario);

        assertEquals("CANCELADO", cancelado.getStatus());
        assertEquals(5, produtoA.getEstoque());
        assertEquals(2, produtoB.getEstoque());
    }

    @Test
    void deveRejeitarEdicaoQuandoEstoqueForInsuficiente() {
        Pedido pedido = criarPedidoExistente(8, usuario, produtoA, 1);
        when(pedidoRepository.findByIdPedidoAndUsuarioId(8, 1)).thenReturn(Optional.of(pedido));
        when(produtoRepository.findById(10)).thenReturn(Optional.of(produtoA));

        PedidoRequest request = new PedidoRequest();
        PedidoItemRequest item = new PedidoItemRequest();
        item.setProdutoId(10);
        item.setQuantidade(4);
        request.setItens(List.of(item));
        request.setEndereco("Rua Teste, 123");
        request.setObservacoes("Entregar na recepção");

        when(carrinhoService.validarEstoque(produtoA, 4)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> pedidoService.atualizarPedido(8, usuario, request));

        assertTrue(exception.getMessage().contains("estoque"));
    }

    private Produto criarProduto(Integer id, String nome, Double preco, Integer estoque) {
        Produto produto = new Produto();
        produto.setIdProduto(id);
        produto.setNomeProduto(nome);
        produto.setPreco(preco);
        produto.setEstoque(estoque);
        return produto;
    }

    private Carrinho criarCarrinho(Produto produto, Integer quantidade) {
        Carrinho carrinho = new Carrinho();
        carrinho.setProduto(produto);
        carrinho.setQuantidade(quantidade);
        return carrinho;
    }

    private Pedido criarPedidoExistente(Integer id, Usuario usuarioPedido, Produto produto1, Integer qtd1) {
        Pedido pedido = new Pedido();
        pedido.setIdPedido(id);
        pedido.setUsuario(usuarioPedido);
        pedido.setStatus("PENDENTE");
        pedido.setEndereco("Rua Antiga");

        PedidoItem item1 = criarPedidoItem(produto1, qtd1);
        pedido.setItens(List.of(item1));
        pedido.setTotal(produto1.getPreco() * qtd1);
        return pedido;
    }

    private Pedido criarPedidoExistente(Integer id, Usuario usuarioPedido, Produto produto1, Integer qtd1,
            Produto produto2, Integer qtd2) {
        Pedido pedido = new Pedido();
        pedido.setIdPedido(id);
        pedido.setUsuario(usuarioPedido);
        pedido.setStatus("PENDENTE");
        pedido.setEndereco("Rua Antiga");

        PedidoItem item1 = criarPedidoItem(produto1, qtd1);
        PedidoItem item2 = criarPedidoItem(produto2, qtd2);
        pedido.setItens(List.of(item1, item2));
        pedido.setTotal((produto1.getPreco() * qtd1) + (produto2.getPreco() * qtd2));
        return pedido;
    }

    private PedidoItem criarPedidoItem(Produto produto, Integer quantidade) {
        PedidoItem item = new PedidoItem();
        item.setProduto(produto);
        item.setQuantidade(quantidade);
        item.setPrecoUnitario(produto.getPreco());
        item.setSubtotal(produto.getPreco() * quantidade);
        return item;
    }
}