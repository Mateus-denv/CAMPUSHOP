package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.ItemPedido;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.PedidoService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioService usuarioService;

    // DTO para itens do pedido, evitando serialização circular pelo relacionamento Pedido<->ItemPedido
    public record ItemPedidoResponse(
            Integer idProduto,
            String nomeProduto,
            Integer quantidade,
            Double precoUnitario) {

        public static ItemPedidoResponse fromEntity(ItemPedido item) {
            return new ItemPedidoResponse(
                    item.getProduto().getIdProduto(),
                    item.getProduto().getNomeProduto(),
                    item.getQuantidade(),
                    item.getPrecoUnitario());
        }
    }

    // DTO do pedido completo para o frontend
    public record PedidoResponse(
            Integer id,
            String status,
            Double total,
            String criadoEm,
            List<ItemPedidoResponse> itens) {

        public static PedidoResponse fromEntity(Pedido pedido) {
            List<ItemPedidoResponse> itensList = pedido.getItens().stream()
                    .map(ItemPedidoResponse::fromEntity)
                    .collect(Collectors.toList());

            return new PedidoResponse(
                    pedido.getId(),
                    pedido.getStatus(),
                    pedido.getTotal(),
                    pedido.getCriadoEm().toString(),
                    itensList);
        }
    }

    // 1. Criar pedido a partir do carrinho do usuário autenticado
    @PostMapping
    public ResponseEntity<?> criarPedido(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Usuário não encontrado"));
        }

        try {
            Pedido pedido = pedidoService.criarPedidoDoCarrinho(usuarioOpt.get().getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(PedidoResponse.fromEntity(pedido));
        } catch (RuntimeException e) {
            // Carrinho vazio ou outro erro de negócio
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", e.getMessage()));
        }
    }

    // 2. Listar pedidos do usuário autenticado
    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarPedidos(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<PedidoResponse> pedidos = pedidoService.listarPorUsuario(usuarioOpt.get().getId())
                .stream()
                .map(PedidoResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(pedidos);
    }
}
