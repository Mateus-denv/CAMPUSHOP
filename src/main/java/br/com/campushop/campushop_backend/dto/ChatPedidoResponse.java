package br.com.campushop.campushop_backend.dto;

public record ChatPedidoResponse(
        Integer pedidoId,
        String status,
        Integer parceiroId,
        String parceiroNome,
        String parceiroPerfil,
        String produtoNome,
        Boolean souVendedor,
        String criadoEm) {
}
