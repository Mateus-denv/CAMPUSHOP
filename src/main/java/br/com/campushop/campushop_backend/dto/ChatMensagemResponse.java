package br.com.campushop.campushop_backend.dto;

public record ChatMensagemResponse(
        Integer id,
        Integer pedidoId,
        Integer usuarioId,
        String usuarioNome,
        String usuarioPerfil,
        String texto,
        String criadoEm) {
}
