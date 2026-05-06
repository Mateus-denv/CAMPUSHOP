package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.PedidoCheckoutRequest;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.PedidoService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private static final Logger logger = LoggerFactory.getLogger(PedidoController.class);

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioService usuarioService;

    // Listar pedidos do usuário
    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidos(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Pedido> pedidos = pedidoService.listarPedidosUsuario(usuarioOpt.get().getId());
        return ResponseEntity.ok(pedidos);
    }

    // Buscar pedido por ID
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPedido(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Pedido> pedidoOpt = pedidoService.buscarPorId(id);

        if (pedidoOpt.isEmpty() || !pedidoOpt.get().getCliente().getId().equals(usuarioOpt.get().getId())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(pedidoOpt.get());
    }

    // Criar pedido (checkout)
    @PostMapping("/checkout")
        public ResponseEntity<?> criarPedido(
            @RequestBody PedidoCheckoutRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Integer idTipoPagamento = request.getIdTipoPagamento();

        try {
            Pedido pedido;
            if (request.getItens() != null && !request.getItens().isEmpty()) {
                pedido = pedidoService.criarPedidoComItens(usuarioOpt.get().getId(), idTipoPagamento, request.getItens());
            } else {
                pedido = pedidoService.criarPedido(usuarioOpt.get().getId(), idTipoPagamento);
            }
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            logger.warn("Erro ao finalizar pedido: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Cancelar pedido
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Pedido> cancelarPedido(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Pedido pedido = pedidoService.cancelarPedido(id, usuarioOpt.get().getId());
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Editar pedido
    @PutMapping("/{id}/editar")
    public ResponseEntity<Pedido> editarPedido(
            @PathVariable Integer id,
            @RequestBody List<PedidoItem> novosItens,
            Authentication authentication) {

        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Pedido pedido = pedidoService.editarPedido(id, usuarioOpt.get().getId(), novosItens);
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}