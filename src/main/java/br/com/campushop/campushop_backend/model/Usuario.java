package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // No diagrama é Integer

    @Column(nullable = false)
    private String nomeCompleto;

    @Column(nullable = false, unique = true)
    private String ra;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "estado", length = 100)
    private String estado;

    @Column(name = "cep", length = 20)
    private String cep;

    @Column(name = "endereco", length = 255)
    private String endereco;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

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

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "data_cadastro", nullable = false)
    private LocalDate dataCadastro;

    @Column(name = "ultima_atualizacao_localizacao")
    private LocalDateTime ultimaAtualizacaoLocalizacao;

    @Column(name = "saldo_vendas", nullable = false, precision = 38, scale = 2)
    private BigDecimal saldoVendas = BigDecimal.ZERO;

    // Constructors
    public Usuario() {
    }

    public Usuario(String nomeCompleto, String ra, String email, String senha, String instituicao, String cidade,
            String perfil) {
        this.nomeCompleto = nomeCompleto;
        this.ra = ra;
        this.email = email;
        this.senha = senha;
        this.instituicaoEnsino = instituicao;
        this.cidade = cidade;
        this.tipoConta = perfil;
        this.ativado = true; // default
        this.dataCadastro = LocalDate.now();
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
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

    public LocalDateTime getUltimaAtualizacaoLocalizacao() {
        return ultimaAtualizacaoLocalizacao;
    }

    public void setUltimaAtualizacaoLocalizacao(LocalDateTime ultimaAtualizacaoLocalizacao) {
        this.ultimaAtualizacaoLocalizacao = ultimaAtualizacaoLocalizacao;
    }

    public BigDecimal getSaldoVendas() {
        return saldoVendas;
    }

    public void setSaldoVendas(BigDecimal saldoVendas) {
        this.saldoVendas = saldoVendas;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nomeCompleto='" + nomeCompleto + '\'' +
                ", ra='" + ra + '\'' +
                ", email='" + email + '\'' +
                ", cidade='" + cidade + '\'' +
                ", nomeCliente='" + nomeCliente + '\'' +
                ", telefone='" + telefone + '\'' +
                ", tipoConta='" + tipoConta + '\'' +
                ", cpfCnpj='" + cpfCnpj + '\'' +
                ", instituicaoEnsino='" + instituicaoEnsino + '\'' +
                ", localizacaoGps='" + localizacaoGps + '\'' +
                ", estado='" + estado + '\'' +
                ", cep='" + cep + '\'' +
                ", endereco='" + endereco + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", ativado=" + ativado +
                ", dataNascimento=" + dataNascimento +
                ", dataCadastro=" + dataCadastro +
                ", ultimaAtualizacaoLocalizacao=" + ultimaAtualizacaoLocalizacao +
                '}';
    }
}