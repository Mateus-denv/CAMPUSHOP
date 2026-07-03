package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.SubscriptionResponse;
import br.com.campushop.campushop_backend.model.PlanType;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.SubscriptionService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UsuarioService usuarioService;

    public SubscriptionController(SubscriptionService subscriptionService, UsuarioService usuarioService) {
        this.subscriptionService = subscriptionService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<SubscriptionResponse> current(Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(subscriptionService.toResponse(usuario));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<SubscriptionResponse> upgrade(Authentication authentication, @RequestParam PlanType plan) {
        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(subscriptionService.toResponse(subscriptionService.upgrade(usuario, plan).getUser()));
    }

    @PostMapping("/downgrade")
    public ResponseEntity<SubscriptionResponse> downgrade(Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(subscriptionService.toResponse(subscriptionService.downgrade(usuario).getUser()));
    }

    @PostMapping("/cancel")
    public ResponseEntity<SubscriptionResponse> cancel(Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(subscriptionService.toResponse(subscriptionService.cancel(usuario).getUser()));
    }

    @PostMapping("/renew")
    public ResponseEntity<SubscriptionResponse> renew(Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(subscriptionService.toResponse(subscriptionService.renew(usuario).getUser()));
    }
}
