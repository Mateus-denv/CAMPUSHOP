package br.com.campushop.campushop_backend.dto;

import java.util.List;

public class PedidoCheckoutRequest {
    private Integer idTipoPagamento;
    private List<PedidoCheckoutItem> itens;

    public Integer getIdTipoPagamento() {
        return idTipoPagamento;
    }

    public void setIdTipoPagamento(Integer idTipoPagamento) {
        this.idTipoPagamento = idTipoPagamento;
    }

    public List<PedidoCheckoutItem> getItens() {
        return itens;
    }

    public void setItens(List<PedidoCheckoutItem> itens) {
        this.itens = itens;
    }
}
