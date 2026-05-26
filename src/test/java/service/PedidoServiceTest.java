package service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.service.CarrinhoService;
import br.com.campushop.campushop_backend.service.PedidoService;
import br.com.campushop.campushop_backend.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
public class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private CarrinhoService carrinhoService;

    @InjectMocks
    private PedidoService service;

    @Test
    void deveBloquearConfirmacaoQuandoCompradorEhOProprioVendedor() {
        // A confirmação precisa falhar antes de criar pedidos quando o carrinho contém
        // produto do próprio usuário.
        Usuario comprador = criarUsuario(7, "comprador@campushop.com");
        Usuario vendedor = criarUsuario(7, "comprador@campushop.com");
        Produto produto = criarProduto(9, vendedor);
        Carrinho item = criarItemCarrinho(produto, 1);

        when(usuarioService.buscarPorEmail("comprador@campushop.com")).thenReturn(java.util.Optional.of(comprador));
        when(carrinhoService.listarPorUsuario(7)).thenReturn(List.of(item));

        RuntimeException excecao = assertThrows(RuntimeException.class,
                () -> service.confirmarPedidosDoCarrinho("comprador@campushop.com"));

        assertEquals("Você não pode comprar este produto porque ele pertence ao seu anúncio", excecao.getMessage());
    }

    private Usuario criarUsuario(Integer id, String email) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setEmail(email);
        usuario.setNomeCompleto("Usuario " + id);
        return usuario;
    }

    private Produto criarProduto(Integer id, Usuario vendedor) {
        Produto produto = new Produto();
        produto.setIdProduto(id);
        produto.setNomeProduto("Produto " + id);
        produto.setPreco(10.0);
        produto.setEstoque(5);
        produto.setUsuario(vendedor);
        return produto;
    }

    private Carrinho criarItemCarrinho(Produto produto, Integer quantidade) {
        Carrinho item = new Carrinho();
        item.setProduto(produto);
        item.setQuantidade(quantidade);
        return item;
    }
}