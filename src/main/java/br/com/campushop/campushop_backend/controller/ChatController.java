package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.ChatMensagemRequest;
import br.com.campushop.campushop_backend.dto.ChatMensagemResponse;
import br.com.campushop.campushop_backend.dto.ChatPedidoResponse;
import br.com.campushop.campushop_backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/pedidos")
    public ResponseEntity<List<ChatPedidoResponse>> listarPedidosParaChat(Authentication authentication) {
        return ResponseEntity.ok(chatService.listarPedidosParaChat(authentication.getName()));
    }

    @GetMapping("/pedidos/{pedidoId}/mensagens")
    public ResponseEntity<?> listarMensagens(@PathVariable Integer pedidoId, Authentication authentication) {
        try {
            List<ChatMensagemResponse> mensagens = chatService.listarMensagensDoPedido(pedidoId, authentication.getName());
            return ResponseEntity.ok(mensagens);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/pedidos/{pedidoId}/mensagens")
    public ResponseEntity<?> enviarMensagem(@PathVariable Integer pedidoId,
                                            @RequestBody @Valid ChatMensagemRequest request,
                                            Authentication authentication) {
        try {
            ChatMensagemResponse mensagem = chatService.enviarMensagem(pedidoId, authentication.getName(), request.texto());
            return ResponseEntity.status(HttpStatus.CREATED).body(mensagem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }
}
