package br.com.campushop.campushop_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import br.com.campushop.campushop_backend.config.LocalDateDeserializer;
import java.time.LocalDate;

public class RegisterRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Pattern(
        regexp = "^[A-Za-zÀ-ÿ]+\\s+[A-Za-zÀ-ÿ]+.*$",
        message = "Informe nome completo"
    )
    private String nomeCompleto;

    @NotBlank(message = "RA é obrigatório")
    @Pattern(regexp = "\\d{9}", message = "RA deve conter 9 dígitos")
    private String ra;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String senha;

    @NotBlank(message = "Confirmação de senha obrigatória")
    private String confirmarSenha;

    @NotBlank(message = "Instituição é obrigatória")
    private String instituicao;

    @NotBlank(message = "Cidade é obrigatória")
    private String cidade;

    @NotBlank(message = "Perfil é obrigatório")
    private String perfil;

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
    private String cpfCnpj;

    @NotNull(message = "Data de nascimento é obrigatória")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    private LocalDate dataNascimento;

    // 🔥 VALIDAÇÃO IMPORTANTE (senha = confirmarSenha)
    @AssertTrue(message = "As senhas não coincidem")
    public boolean isSenhaValida() {
        if (senha == null || confirmarSenha == null) return false;
        return senha.equals(confirmarSenha);
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getRa() {
        return ra;
    }

    public void setRa(String ra) {
        this.ra = ra;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getConfirmarSenha() {
        return confirmarSenha;
    }

    public void setConfirmarSenha(String confirmarSenha) {
        this.confirmarSenha = confirmarSenha;
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

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }

    public String getCpfCnpj() {
        return cpfCnpj;
    }

    public void setCpfCnpj(String cpfCnpj) {
        this.cpfCnpj = cpfCnpj;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
}