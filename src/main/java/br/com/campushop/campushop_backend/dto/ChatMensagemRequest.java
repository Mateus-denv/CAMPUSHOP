package br.com.campushop.campushop_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatMensagemRequest(
                @NotBlank(message = "Texto da mensagem é obrigatório") String texto,
                @NotNull(message = "Confirmação do aviso é obrigatória") Boolean aceitouAviso) {
}
