package br.com.campushop.campushop_backend.dto;

import jakarta.validation.constraints.*;

/**
 * DTO para requisição de cadastro de novo usuário
 * Todas as validações estão aqui - Spring valida automaticamente
 */
public class CadastroRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String nomeCompleto;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido (ex: usuario@universidade.edu)")
    private String email;

    @NotBlank(message = "RA é obrigatório")
    @Pattern(regexp = "\\d{6,12}", message = "RA deve conter apenas números (6-12 dígitos)")
    private String ra;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, max = 64, message = "Senha deve ter entre 8 e 64 caracteres")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
        message = "Senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial (@#$%^&+=!)"
    )
    private String senha;

    @NotBlank(message = "Confirmação de senha é obrigatória")
    private String confirmacaoSenha;

    @NotBlank(message = "Instituição de ensino é obrigatória")
    @Size(min = 3, max = 100, message = "Instituição deve ter entre 3 e 100 caracteres")
    private String instituicao;

    @NotBlank(message = "Cidade é obrigatória")
    @Size(min = 2, max = 100, message = "Cidade deve ter entre 2 e 100 caracteres")
    private String cidade;

    // Getters e Setters
    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRa() {
        return ra;
    }

    public void setRa(String ra) {
        this.ra = ra;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getConfirmacaoSenha() {
        return confirmacaoSenha;
    }

    public void setConfirmacaoSenha(String confirmacaoSenha) {
        this.confirmacaoSenha = confirmacaoSenha;
    }

    public String getInstituicao() {
        return instituicao;
    }

    public void setInstituicao(String instituicao) {
        this.instituicao = instituicao;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }
}
