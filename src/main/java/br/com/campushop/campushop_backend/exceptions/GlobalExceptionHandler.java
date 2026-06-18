package br.com.campushop.campushop_backend.exceptions;

import br.com.campushop.campushop_backend.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manipulador global de exceções (Global Exception Handler)
 * Centraliza o tratamento de erros em toda a aplicação
 * Garante respostas consistentes e informativas para o cliente
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Trata erro de validação (@Valid falhou em um DTO)
     * Exemplo: Email está vazio ou tem formato inválido
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        logger.warn("Erro de validação detectado: {}", ex.getMessage());

        // Coleta todos os erros de validação por campo
        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            String mensagem = error.getDefaultMessage();
            erros.put(campo, mensagem);
            logger.warn("Campo '{}' inválido: {}", campo, mensagem);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        LocalDateTime.now(),
                        400,
                        "Validação falhou",
                        erros.size() == 1 ? erros.values().iterator().next() : erros.toString()));
    }

    /**
     * Trata quando um recurso não é encontrado
     * Exemplo: Produto com ID 999 não existe no banco
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        logger.warn("Recurso não encontrado: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        LocalDateTime.now(),
                        404,
                        "Recurso não encontrado",
                        ex.getMessage()));
    }

    /**
     * Trata erro de autenticação (senha errada)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        logger.warn("Tentativa de login com credenciais inválidas");

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        LocalDateTime.now(),
                        401,
                        "Credenciais inválidas",
                        "Email ou senha incorretos"));
    }

    /**
     * Trata erro de autorização (sem permissão)
     * Exemplo: User tenta deletar produto de outro user
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        logger.warn("Acesso negado: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        LocalDateTime.now(),
                        403,
                        "Acesso negado",
                        "Você não tem permissão para esta ação"));
    }

    /**
     * Trata erro de argumento inválido (ex: senhas não conferem)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Argumento inválido: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        LocalDateTime.now(),
                        400,
                        "Requisição inválida",
                        ex.getMessage()));
    }

    /**
     * Fallback para qualquer outra exceção não tratada
     * Evita que erros inesperados exponham informações sensíveis
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        logger.error("Erro interno não previsto", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        LocalDateTime.now(),
                        500,
                        "Erro interno do servidor",
                        "Ocorreu um erro inesperado. Tente novamente."));
    }
}
