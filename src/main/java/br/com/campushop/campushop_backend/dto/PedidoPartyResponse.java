package br.com.campushop.campushop_backend.dto;

public record PedidoPartyResponse(
        Integer id,
        String nome,
        String email,
        String perfil) {
}