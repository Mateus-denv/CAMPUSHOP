package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.PedidoResponse;
import br.com.campushop.campushop_backend.dto.UpdatePedidoStatusRequest;
import br.com.campushop.campushop_backend.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarPedidos(Authentication authentication) {
        try {
            List<PedidoResponse> pedidos = pedidoService.confirmarPedidosDoCarrinho(authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(pedidos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/meus")
    public ResponseEntity<List<PedidoResponse>> meusPedidos(Authentication authentication) {
        return ResponseEntity.ok(pedidoService.listarPedidosDoComprador(authentication.getName()));
    }

    @GetMapping("/recebidos")
    public ResponseEntity<List<PedidoResponse>> pedidosRecebidos(Authentication authentication) {
        return ResponseEntity.ok(pedidoService.listarPedidosDoVendedor(authentication.getName()));
    }

    @GetMapping("/recebidos/pendentes/contagem")
    public ResponseEntity<Map<String, Long>> contarPendentes(Authentication authentication) {
        Map<String, Long> response = new HashMap<>();
        response.put("total", pedidoService.contarPedidosPendentesDoVendedor(authentication.getName()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable Integer id,
            @RequestBody @Valid UpdatePedidoStatusRequest request,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(pedidoService.atualizarStatus(id, authentication.getName(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}