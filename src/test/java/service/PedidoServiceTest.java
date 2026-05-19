package service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.campushop.campushop_backend.dto.PedidoItemRequest;
import br.com.campushop.campushop_backend.exception.BusinessException;
import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;
import br.com.campushop.campushop_backend.model.PedidoStatus;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import br.com.campushop.campushop_backend.service.CarrinhoService;
import br.com.campushop.campushop_backend.service.PedidoService;

@ExtendWith(MockitoExtension.class)
public class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CarrinhoService carrinhoService;

    @InjectMocks
    private PedidoService service;

    @Test
    void deveCriarPedidoQuandoEstoqueSuficiente() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setEmail("teste@campushop.com");

        Produto produto = new Produto();
        produto.setIdProduto(1);
        produto.setNomeProduto("Caneta");
        produto.setPreco(3.0);
        produto.setEstoque(5);

        Carrinho carrinho = new Carrinho();
        carrinho.setProduto(produto);
        carrinho.setQuantidade(2);

        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(carrinhoService.listarPorUsuario(1)).thenReturn(List.of(carrinho));
        when(pedidoRepository.save(org.mockito.ArgumentMatchers.any(Pedido.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Pedido pedido = service.criarPedido(1, "Rua A", "123456789");

        assertEquals(PedidoStatus.PENDENTE, pedido.getStatus());
        assertEquals(6.0, pedido.getTotal());
        verify(carrinhoService).limparCarrinho(1);
    }

    @Test
    void deveFalharQuandoEstoqueInsuficiente() {
        Usuario usuario = new Usuario();
        usuario.setId(1);

        Produto produto = new Produto();
        produto.setIdProduto(1);
        produto.setNomeProduto("Caderno");
        produto.setPreco(10.0);
        produto.setEstoque(2);

        Carrinho carrinho = new Carrinho();
        carrinho.setProduto(produto);
        carrinho.setQuantidade(5);

        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(carrinhoService.listarPorUsuario(1)).thenReturn(List.of(carrinho));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> service.criarPedido(1, "Rua A", "123456789"));

        assertEquals("Estoque insuficiente para Caderno. Estoque disponível: 2, solicitado: 5", exception.getMessage());
    }

    @Test
    void deveEditarPedidoQuandoPedidoPendenteEEstoqueSuficiente() {
        Usuario usuario = new Usuario();
        usuario.setId(1);

        Produto produto = new Produto();
        produto.setIdProduto(1);
        produto.setNomeProduto("Lapis");
        produto.setPreco(2.0);
        produto.setEstoque(10);

        Pedido pedido = new Pedido();
        pedido.setId(100);
        pedido.setUsuario(usuario);
        pedido.setStatus(PedidoStatus.PENDENTE);
        pedido.setEndereco("Rua A");
        pedido.setTelefone("123456789");

        PedidoItem item = new PedidoItem();
        item.setProduto(produto);
        item.setQuantidade(1);
        item.setPrecoUnitario(2.0);
        pedido.setItens(List.of(item));
        pedido.atualizarTotal();

        when(pedidoRepository.findById(100)).thenReturn(Optional.of(pedido));
        when(produtoRepository.findById(1)).thenReturn(Optional.of(produto));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PedidoItemRequest itemRequest = new PedidoItemRequest();
        itemRequest.setProdutoId(1);
        itemRequest.setQuantidade(3);

        Pedido pedidoAtualizado = service.editarPedido(1, 100, List.of(itemRequest));

        assertEquals(PedidoStatus.PENDENTE, pedidoAtualizado.getStatus());
        assertEquals(6.0, pedidoAtualizado.getTotal());
        assertEquals(1, pedidoAtualizado.getItens().size());
        assertEquals(3, pedidoAtualizado.getItens().get(0).getQuantidade());
    }

    @Test
    void deveCancelarPedidoPendente() {
        Usuario usuario = new Usuario();
        usuario.setId(1);

        Pedido pedido = new Pedido();
        pedido.setId(100);
        pedido.setUsuario(usuario);
        pedido.setStatus(PedidoStatus.PENDENTE);

        when(pedidoRepository.findById(100)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Pedido pedidoCancelado = service.cancelarPedido(1, 100);

        assertEquals(PedidoStatus.CANCELADO, pedidoCancelado.getStatus());
        verify(pedidoRepository).save(pedidoCancelado);
    }
}
