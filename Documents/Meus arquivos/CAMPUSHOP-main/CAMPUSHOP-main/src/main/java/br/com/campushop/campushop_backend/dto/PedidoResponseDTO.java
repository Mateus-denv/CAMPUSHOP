package br.com.campushop.campushop_backend.dto;

import br.com.campushop.campushop_backend.enums.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoResponseDTO {

    private Long id;
    private Long clienteId;
    private String clienteEmail;
    private LocalDateTime data;
    private StatusPedido status;
    private BigDecimal valorTotal;
    private List<PedidoItemResponseDTO> itens;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getClienteEmail() {
        return clienteEmail;
    }

    public void setClienteEmail(String clienteEmail) {
        this.clienteEmail = clienteEmail;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public StatusPedido getStatus() {
        return status;
    }

    public void setStatus(StatusPedido status) {
        this.status = status;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public List<PedidoItemResponseDTO> getItens() {
        return itens;
    }

    public void setItens(List<PedidoItemResponseDTO> itens) {
        this.itens = itens;
    }
}
