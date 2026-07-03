package br.com.campushop.campushop_backend.dto;

import java.time.LocalDateTime;

/**
 * DTO para resposta de avaliação de produto.
 * Retorna os dados da avaliação ao cliente com formatação adequada.
 */
public class AvaliacaoResponse {

    private Integer idAvaliacao;
    private Integer idProduto;
    private String nomeProduto;
    private Integer idUsuario;
    private String nomeUsuario;
    private Integer nota;
    private String feedback;
    private LocalDateTime dataAvaliacao;
    private String status;

    // ===== CONSTRUTORES =====

    public AvaliacaoResponse() {
    }

    public AvaliacaoResponse(Integer idAvaliacao, Integer idProduto, String nomeProduto,
                             Integer idUsuario, String nomeUsuario, Integer nota,
                             String feedback, LocalDateTime dataAvaliacao, String status) {
        this.idAvaliacao = idAvaliacao;
        this.idProduto = idProduto;
        this.nomeProduto = nomeProduto;
        this.idUsuario = idUsuario;
        this.nomeUsuario = nomeUsuario;
        this.nota = nota;
        this.feedback = feedback;
        this.dataAvaliacao = dataAvaliacao;
        this.status = status;
    }

    // ===== GETTERS E SETTERS =====

    public Integer getIdAvaliacao() {
        return idAvaliacao;
    }

    public void setIdAvaliacao(Integer idAvaliacao) {
        this.idAvaliacao = idAvaliacao;
    }

    public Integer getIdProduto() {
        return idProduto;
    }

    public void setIdProduto(Integer idProduto) {
        this.idProduto = idProduto;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNomeUsuario() {
        return nomeUsuario;
    }

    public void setNomeUsuario(String nomeUsuario) {
        this.nomeUsuario = nomeUsuario;
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
        return "AvaliacaoResponse{" +
                "idAvaliacao=" + idAvaliacao +
                ", idProduto=" + idProduto +
                ", nomeProduto='" + nomeProduto + '\'' +
                ", idUsuario=" + idUsuario +
                ", nomeUsuario='" + nomeUsuario + '\'' +
                ", nota=" + nota +
                ", feedback='" + feedback + '\'' +
                ", dataAvaliacao=" + dataAvaliacao +
                ", status='" + status + '\'' +
                '}';
    }
}
