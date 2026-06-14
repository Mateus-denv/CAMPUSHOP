package br.com.campushop.campushop_backend.dto;

import jakarta.validation.constraints.*;

/**
 * DTO para requisição de reset de senha
 */
public class ResetSenhaRequestDTO {

    @NotBlank(message = "Token é obrigatório")
    private String token;

    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, max = 64, message = "Senha deve ter entre 8 e 64 caracteres")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$", message = "Senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial")
    private String novaSenha;

    @NotBlank(message = "Confirmação é obrigatória")
    private String confirmacaoSenha;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNovaSenha() {
        return novaSenha;
    }

    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }

    public String getConfirmacaoSenha() {
        return confirmacaoSenha;
    }

    public void setConfirmacaoSenha(String confirmacaoSenha) {
        this.confirmacaoSenha = confirmacaoSenha;
    }
}
