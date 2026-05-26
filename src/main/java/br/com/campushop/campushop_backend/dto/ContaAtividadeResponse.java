package br.com.campushop.campushop_backend.dto;

import java.math.BigDecimal;

public record ContaAtividadeResponse(
        Integer id,
        String tipo,
        String status,
        BigDecimal total,
        String data,
        String participante) {
}