package br.com.campushop.campushop_backend.dto;

import java.util.List;

public class PedidoRequest {

    private List<PedidoItemRequest> itens;
    private String endereco;
    private String observacoes;

    public List<PedidoItemRequest> getItens() {
        return itens;
    }

    public void setItens(List<PedidoItemRequest> itens) {
        this.itens = itens;
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
}