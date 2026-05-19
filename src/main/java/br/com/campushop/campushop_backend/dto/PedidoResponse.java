package br.com.campushop.campushop_backend.dto;

import br.com.campushop.campushop_backend.model.Pedido;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PedidoResponse {

    private Integer idPedido;
    private LocalDateTime dataPedido;
    private Double total;
    private String status;
    private String endereco;
    private String observacoes;
    private List<PedidoItemResponse> itens;

    public static PedidoResponse fromEntity(Pedido pedido) {
        // Mantém o contrato da API simples e evita expor a entidade JPA diretamente.
        PedidoResponse response = new PedidoResponse();
        response.setIdPedido(pedido.getIdPedido());
        response.setDataPedido(pedido.getDataPedido());
        response.setTotal(pedido.getTotal());
        response.setStatus(pedido.getStatus());
        response.setEndereco(pedido.getEndereco());
        response.setObservacoes(pedido.getObservacoes());
        response.setItens(pedido.getItens().stream()
                .map(PedidoItemResponse::fromEntity)
                .collect(Collectors.toList()));
        return response;
    }

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public List<PedidoItemResponse> getItens() {
        return itens;
    }

    public void setItens(List<PedidoItemResponse> itens) {
        this.itens = itens;
    }
}