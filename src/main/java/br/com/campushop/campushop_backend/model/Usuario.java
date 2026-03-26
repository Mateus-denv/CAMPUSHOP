package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCompleto;

    @Column(nullable = false, unique = true)
    private String ra;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String instituicao;

    @Column(nullable = false)
    private String cidade;

    @Column(nullable = false)
    private String perfil;

    // Constructors
    public Usuario() {
    }

    public Usuario(String nomeCompleto, String ra, String email, String senha, String instituicao, String cidade,
            String perfil) {
        this.nomeCompleto = nomeCompleto;
        this.ra = ra;
        this.email = email;
        this.senha = senha;
        this.instituicao = instituicao;
        this.cidade = cidade;
        this.perfil = perfil;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
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

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nomeCompleto='" + nomeCompleto + '\'' +
                ", ra='" + ra + '\'' +
                ", email='" + email + '\'' +
                ", instituicao='" + instituicao + '\'' +
                ", cidade='" + cidade + '\'' +
                ", perfil='" + perfil + '\'' +
                '}';
    }
}
