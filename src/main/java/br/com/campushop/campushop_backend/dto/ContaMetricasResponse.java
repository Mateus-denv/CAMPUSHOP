package br.com.campushop.campushop_backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record ContaMetricasResponse(
        long produtosTotais,
        long produtosAtivos,
        long vendasConcluidas,
        long comprasConcluidas,
        long pedidosPendentes,
        BigDecimal faturamentoVendas,
        BigDecimal gastoCompras,
        BigDecimal ticketMedioVendas,
        BigDecimal ticketMedioCompras,
        long avaliacoesRecebidas,
        BigDecimal notaMediaRecebida,
        List<ContaAtividadeResponse> atividadesRecentes) {
}