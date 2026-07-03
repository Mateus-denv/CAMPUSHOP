package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

/**
 * Modelo que representa uma avaliação de produto.
 * Armazena nota (1-10 estrelas) e feedback do comprador sobre um produto.
 */
@Entity
@Table(name = "avaliacao")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_avaliacao")
    private Integer idAvaliacao;

    // Referência ao produto que está sendo avaliado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    // Referência ao usuário que fez a avaliação (comprador)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // Nota de 1 a 10 estrelas — validada no controller e na service
    @Column(name = "nota", nullable = false)
    private Integer nota;

    // Feedback textual do comprador — limitado a 500 caracteres para evitar dados enormes
    @Column(name = "feedback", length = 500)
    private String feedback;

    // Data de criação da avaliação
    @Column(name = "data_avaliacao", nullable = false)
    private LocalDateTime dataAvaliacao;

    // Status da avaliação (ATIVA ou INATIVA) — permite desativar avaliações sem deletar
    @Column(name = "status", length = 20, nullable = false)
    private String status = "ATIVA";

    // ===== CONSTRUTORES =====

    public Avaliacao() {
    }

    public Avaliacao(Produto produto, Usuario usuario, Integer nota, String feedback) {
        this.produto = produto;
        this.usuario = usuario;
        this.nota = nota;
        this.feedback = feedback;
        this.dataAvaliacao = LocalDateTime.now();
        this.status = "ATIVA";
    }

    // ===== GETTERS E SETTERS =====

    public Integer getIdAvaliacao() {
        return idAvaliacao;
    }

    public void setIdAvaliacao(Integer idAvaliacao) {
        this.idAvaliacao = idAvaliacao;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Integer getNota() {
        return nota;
    }

    public void setNota(Integer nota) {
        this.nota = nota;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getDataAvaliacao() {
        return dataAvaliacao;
    }

    public void setDataAvaliacao(LocalDateTime dataAvaliacao) {
        this.dataAvaliacao = dataAvaliacao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Avaliacao{" +
                "idAvaliacao=" + idAvaliacao +
                ", nota=" + nota +
                ", feedback='" + feedback + '\'' +
                ", dataAvaliacao=" + dataAvaliacao +
                ", status='" + status + '\'' +
                '}';
    }
}
