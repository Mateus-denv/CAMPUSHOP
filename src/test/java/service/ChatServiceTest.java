package service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.ChatMensagemRepository;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.service.ChatService;
import br.com.campushop.campushop_backend.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatMensagemRepository chatMensagemRepository;

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private ChatService service;

    @Test
    void deveBloquearEnvioDeMensagemQuandoPedidoForRejeitado() {
        Pedido pedido = new Pedido();
        pedido.setIdPedido(10);
        pedido.setStatusPedido("rejeitado");

        Usuario comprador = new Usuario();
        comprador.setId(1);
        comprador.setEmail("comprador@email.com");
        comprador.setNomeCompleto("Comprador");

        Usuario vendedor = new Usuario();
        vendedor.setId(2);
        vendedor.setEmail("vendedor@email.com");
        vendedor.setNomeCompleto("Vendedor");

        pedido.setUsuario(comprador);
        pedido.setVendedor(vendedor);

        when(pedidoRepository.findDetalhadoById(10)).thenReturn(Optional.of(pedido));

        RuntimeException excecao = assertThrows(RuntimeException.class,
                () -> service.enviarMensagem(10, "comprador@email.com", "Olá", Boolean.TRUE));

        assertTrue(excecao.getMessage().contains("não está disponível"));
    }
}
