package br.com.campushop.campushop_backend.dto;

import br.com.campushop.campushop_backend.model.PedidoItem;

public class PedidoItemResponse {

    private Integer idItem;
    private Integer produtoId;
    private String nomeProduto;
    private Integer quantidade;
    private Double precoUnitario;
    private Double subtotal;

    public static PedidoItemResponse fromEntity(PedidoItem item) {
        // Expõe apenas os dados necessários para a tela de pedidos.
        PedidoItemResponse response = new PedidoItemResponse();
        response.setIdItem(item.getIdItem());
        response.setProdutoId(item.getProduto() != null ? item.getProduto().getIdProduto() : null);
        response.setNomeProduto(item.getProduto() != null ? item.getProduto().getNomeProduto() : null);
        response.setQuantidade(item.getQuantidade());
        response.setPrecoUnitario(item.getPrecoUnitario());
        response.setSubtotal(item.getSubtotal());
        return response;
    }

    public Integer getIdItem() {
        return idItem;
    }

    public void setIdItem(Integer idItem) {
        this.idItem = idItem;
    }

    public Integer getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Integer produtoId) {
        this.produtoId = produtoId;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public Double getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(Double precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
}