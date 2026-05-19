package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.PedidoRequest;
import br.com.campushop.campushop_backend.dto.PedidoResponse;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.PedidoService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;

    public PedidoController(PedidoService pedidoService, UsuarioService usuarioService) {
        this.pedidoService = pedidoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarPedidos(Authentication authentication) {
        Optional<Usuario> usuarioOpt = buscarUsuarioLogado(authentication);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioOpt.get().getId()).stream()
                // A resposta padronizada evita expor a estrutura interna da entidade JPA.
                .map(PedidoResponse::fromEntity)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscarPedido(@PathVariable Integer id, Authentication authentication) {
        Optional<Usuario> usuarioOpt = buscarUsuarioLogado(authentication);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return pedidoService.buscarPorIdDoUsuario(id, usuarioOpt.get().getId())
                .map(pedido -> ResponseEntity.ok(PedidoResponse.fromEntity(pedido)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criarPedido(@RequestBody(required = false) PedidoRequest request,
            Authentication authentication) {
        try {
            Optional<Usuario> usuarioOpt = buscarUsuarioLogado(authentication);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro("Usuário não encontrado"));
            }

            Pedido pedido = pedidoService.criarPedido(usuarioOpt.get(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(PedidoResponse.fromEntity(pedido));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(erro(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarPedido(@PathVariable Integer id, @RequestBody PedidoRequest request,
            Authentication authentication) {
        try {
            Optional<Usuario> usuarioOpt = buscarUsuarioLogado(authentication);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro("Usuário não encontrado"));
            }

            Pedido pedidoAtualizado = pedidoService.atualizarPedido(id, usuarioOpt.get(), request);
            return ResponseEntity.ok(PedidoResponse.fromEntity(pedidoAtualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(erro(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarPedido(@PathVariable Integer id, Authentication authentication) {
        try {
            Optional<Usuario> usuarioOpt = buscarUsuarioLogado(authentication);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro("Usuário não encontrado"));
            }

            Pedido pedidoCancelado = pedidoService.cancelarPedido(id, usuarioOpt.get());
            return ResponseEntity.ok(PedidoResponse.fromEntity(pedidoCancelado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(erro(e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarPedidoComPut(@PathVariable Integer id, Authentication authentication) {
        // Mantém compatibilidade com clientes que prefiram um verbo explícito para o
        // cancelamento.
        return cancelarPedido(id, authentication);
    }

    private Optional<Usuario> buscarUsuarioLogado(Authentication authentication) {
        return usuarioService.buscarPorEmail(authentication.getName());
    }

    private Map<String, String> erro(String mensagem) {
        Map<String, String> resposta = new HashMap<>();
        resposta.put("erro", mensagem);
        return resposta;
    }
}