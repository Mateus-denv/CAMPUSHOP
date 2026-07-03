package br.com.campushop.campushop_backend.validation;

import org.springframework.stereotype.Component;

/**
 * Validator para validação de dados de avaliação de produto.
 * Centraliza regras de validação seguindo o padrão do projeto.
 */
@Component
public class AvaliacaoValidator {

    private static final Integer NOTA_MINIMA = 1;
    private static final Integer NOTA_MAXIMA = 10;
    private static final Integer FEEDBACK_MAX_CARACTERES = 500;

    /**
     * Valida a nota da avaliação.
     * Nota deve estar entre 1 e 10 estrelas (inclusive).
     */
    public void validarNota(Integer nota) {
        if (nota == null) {
            throw new RuntimeException("Nota é obrigatória");
        }
        if (nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
            throw new RuntimeException(
                "Nota deve estar entre " + NOTA_MINIMA + " e " + NOTA_MAXIMA + " estrelas. Recebido: " + nota);
        }
    }

    /**
     * Valida o feedback da avaliação.
     * Feedback é opcional, mas se fornecido não pode exceder 500 caracteres.
     */
    public void validarFeedback(String feedback) {
        if (feedback != null && feedback.length() > FEEDBACK_MAX_CARACTERES) {
            throw new RuntimeException(
                "Feedback não pode exceder " + FEEDBACK_MAX_CARACTERES + " caracteres. Atual: " + feedback.length());
        }
        
        // Feedback vazio após trim é tratado como null — validação de negócio
        if (feedback != null && feedback.trim().isEmpty()) {
            throw new RuntimeException("Feedback não pode conter apenas espaços em branco");
        }
    }

    /**
     * Valida status da avaliação.
     * Status válidos: ATIVA ou INATIVA.
     */
    public void validarStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException("Status é obrigatório");
        }
        
        String statusUpper = status.toUpperCase().trim();
        if (!statusUpper.equals("ATIVA") && !statusUpper.equals("INATIVA")) {
            throw new RuntimeException("Status deve ser ATIVA ou INATIVA. Recebido: " + status);
        }
    }
}
