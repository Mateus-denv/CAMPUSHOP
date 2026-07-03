package br.com.campushop.campushop_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatMensagemRequest(
        @NotBlank(message = "Texto da mensagem é obrigatório")
        String texto) {
}
