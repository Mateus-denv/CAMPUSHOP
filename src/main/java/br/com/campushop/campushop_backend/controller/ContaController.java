package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.ContaMetricasResponse;
import br.com.campushop.campushop_backend.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conta")
public class ContaController {

    private final PedidoService pedidoService;

    public ContaController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping("/metricas")
    public ResponseEntity<ContaMetricasResponse> metricas(Authentication authentication) {
        return ResponseEntity.ok(pedidoService.obterMetricasConta(authentication.getName()));
    }
}