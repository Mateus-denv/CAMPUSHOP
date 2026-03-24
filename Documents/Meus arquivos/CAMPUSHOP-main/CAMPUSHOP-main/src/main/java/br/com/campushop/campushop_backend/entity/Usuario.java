package br.com.campushop.campushop_backend.entity;

import br.com.campushop.campushop_backend.enums.TipoUsuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCompleto;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false)
    private TipoUsuario tipoUsuario = TipoUsuario.CLIENTE;

    public Usuario() {
    }

    public Usuario(String nomeCompleto, String email, String senha, String instituicao, String cidade, String perfil) {
        this.nomeCompleto = nomeCompleto;
        this.email = email;
        this.senha = senha;
        this.instituicao = instituicao;
        this.cidade = cidade;
        setPerfil(perfil);
    }

    @PrePersist
    @PreUpdate
    public void sincronizarPerfilETipo() {
        if (tipoUsuario == null) {
            tipoUsuario = converterPerfilParaTipo(perfil);
        }
        if (perfil == null || perfil.isBlank()) {
            perfil = tipoUsuario.name();
        }
    }

    private TipoUsuario converterPerfilParaTipo(String valorPerfil) {
        if (valorPerfil == null || valorPerfil.isBlank()) {
            return TipoUsuario.CLIENTE;
        }
        try {
            return TipoUsuario.valueOf(valorPerfil.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return TipoUsuario.CLIENTE;
        }
    }

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
        this.tipoUsuario = converterPerfilParaTipo(perfil);
    }

    public TipoUsuario getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(TipoUsuario tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
        if (tipoUsuario != null) {
            this.perfil = tipoUsuario.name();
        }
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nomeCompleto='" + nomeCompleto + '\'' +
                ", email='" + email + '\'' +
                ", instituicao='" + instituicao + '\'' +
                ", cidade='" + cidade + '\'' +
                ", tipoUsuario='" + tipoUsuario + '\'' +
                '}';
    }
}
