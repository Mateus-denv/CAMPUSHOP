package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.PedidoCreateRequestDTO;
import br.com.campushop.campushop_backend.dto.PedidoResponseDTO;
import br.com.campushop.campushop_backend.dto.PedidoStatusUpdateDTO;
import br.com.campushop.campushop_backend.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoRestController {

    private final PedidoService pedidoService;

    public PedidoRestController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criar(@Valid @RequestBody PedidoCreateRequestDTO request,
            Authentication authentication) {
        PedidoResponseDTO response = pedidoService.criarPedido(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<PedidoResponseDTO>> listarMeus(Authentication authentication) {
        return ResponseEntity.ok(pedidoService.listarPedidosDoCliente(authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(@PathVariable Long id,
            @Valid @RequestBody PedidoStatusUpdateDTO request,
            Authentication authentication) {
        return ResponseEntity.ok(pedidoService.atualizarStatus(id, request, authentication.getName()));
    }
}
