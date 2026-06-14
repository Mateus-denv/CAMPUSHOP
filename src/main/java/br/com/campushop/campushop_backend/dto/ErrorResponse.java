package br.com.campushop.campushop_backend.dto;

import java.time.LocalDateTime;

/**
 * Resposta padronizada para erros em toda a API
 * Garante que todos os erros retornem no mesmo formato
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message) {
}
