package br.com.campushop.campushop_backend.dto;

import java.util.List;

public class PedidoEdicaoRequest {
    private List<PedidoItemRequest> itens;

    public List<PedidoItemRequest> getItens() {
        return itens;
    }

    public void setItens(List<PedidoItemRequest> itens) {
        this.itens = itens;
    }
}
