package br.com.campushop.campushop_backend.dto;

import java.math.BigDecimal;

public record PedidoItemResponse(
        Integer productId,
        String productName,
        Integer quantidade,
        BigDecimal precoUnitario,
        Integer vendedorId,
        String vendedorNome) {
}