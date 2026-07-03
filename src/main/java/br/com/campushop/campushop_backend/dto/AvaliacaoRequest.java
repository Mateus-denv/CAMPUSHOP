package br.com.campushop.campushop_backend.dto;

/**
 * DTO para requisição de criação/atualização de avaliação de produto.
 * Recebe dados do cliente com validação de limites.
 */
public class AvaliacaoRequest {

    private Integer idProduto;
    private Integer nota;
    private String feedback;

    // ===== CONSTRUTORES =====

    public AvaliacaoRequest() {
    }

    public AvaliacaoRequest(Integer idProduto, Integer nota, String feedback) {
        this.idProduto = idProduto;
        this.nota = nota;
        this.feedback = feedback;
    }

    // ===== GETTERS E SETTERS =====

    public Integer getIdProduto() {
        return idProduto;
    }

    public void setIdProduto(Integer idProduto) {
        this.idProduto = idProduto;
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

    @Override
    public String toString() {
        return "AvaliacaoRequest{" +
                "idProduto=" + idProduto +
                ", nota=" + nota +
                ", feedback='" + feedback + '\'' +
                '}';
    }
}
