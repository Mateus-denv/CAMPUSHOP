package br.com.campushop.campushop_backend.exceptions;

/**
 * Exceção customizada para quando um recurso não é encontrado no banco de dados
 * Exemplo: Produto com ID 999 não existe
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String mensagem) {
        super(mensagem);
    }

    public ResourceNotFoundException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}
