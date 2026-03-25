package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // No diagrama é Integer

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "cidade", length = 100)
    private String cidade;

    // Forçando o nome exato do diagrama
    @Column(name = "nomeCliente", nullable = false, length = 100)
    private String nomeCliente;

    @Column(name = "senha", nullable = false, length = 255)
    private String senha;

    @Column(name = "telefone", length = 15)
    private String telefone;

    @Column(name = "tipo_conta", length = 20)
    private String tipoConta;

    @Column(name = "cpf_cnpj", length = 20)
    private String cpfCnpj;

    @Column(name = "instituicao_ensino", length = 100)
    private String instituicaoEnsino;

    @Column(name = "localizacao_gps", length = 50)
    private String localizacaoGps;

    @Column(name = "ativado", nullable = false)
    private Boolean ativado;

    @Column(name = "data_cadastro", nullable = false)
    private LocalDate dataCadastro;

    // Constructors
    public Usuario() {
    }

    public Usuario(String email, String cidade, String nomeCliente, String senha, String telefone,
            String tipoConta, String tipoCliente, String cpfCnpj, String instituicaoEnsino,
            String localizacaoGps, Boolean ativado, LocalDate dataCadastro) {
        this.email = email;
        this.cidade = cidade;
        this.nomeCliente = nomeCliente;
        this.senha = senha;
        this.telefone = telefone;
        this.tipoConta = tipoConta;
        this.cpfCnpj = cpfCnpj;
        this.instituicaoEnsino = instituicaoEnsino;
        this.localizacaoGps = localizacaoGps;
        this.ativado = ativado;
        this.dataCadastro = dataCadastro;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getTipoConta() {
        return tipoConta;
    }

    public void setTipoConta(String tipoConta) {
        this.tipoConta = tipoConta;
    }

    public String getCpfCnpj() {
        return cpfCnpj;
    }

    public void setCpfCnpj(String cpfCnpj) {
        this.cpfCnpj = cpfCnpj;
    }

    public String getInstituicaoEnsino() {
        return instituicaoEnsino;
    }

    public void setInstituicaoEnsino(String instituicaoEnsino) {
        this.instituicaoEnsino = instituicaoEnsino;
    }

    public String getLocalizacaoGps() {
        return localizacaoGps;
    }

    public void setLocalizacaoGps(String localizacaoGps) {
        this.localizacaoGps = localizacaoGps;
    }

    public Boolean getAtivado() {
        return ativado;
    }

    public void setAtivado(Boolean ativado) {
        this.ativado = ativado;
    }

    public LocalDate getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDate dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", cidade='" + cidade + '\'' +
                ", nomeCliente='" + nomeCliente + '\'' +
                ", telefone='" + telefone + '\'' +
                ", tipoConta='" + tipoConta + '\'' +
                ", cpfCnpj='" + cpfCnpj + '\'' +
                ", instituicaoEnsino='" + instituicaoEnsino + '\'' +
                ", localizacaoGps='" + localizacaoGps + '\'' +
                ", ativado=" + ativado +
                ", dataCadastro=" + dataCadastro +
                '}';
    }
}