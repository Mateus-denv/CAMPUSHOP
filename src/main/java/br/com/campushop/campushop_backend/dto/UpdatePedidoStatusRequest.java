package br.com.campushop.campushop_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePedidoStatusRequest(
        @NotBlank(message = "Status do pedido é obrigatório")
        String status,
        String codigoAcesso) {
}