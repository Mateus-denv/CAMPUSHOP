package br.com.campushop.campushop_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class PedidoCreateRequestDTO {

    @NotEmpty(message = "Pedido deve conter pelo menos um item")
    @Valid
    private List<PedidoItemRequestDTO> itens;

    public List<PedidoItemRequestDTO> getItens() {
        return itens;
    }

    public void setItens(List<PedidoItemRequestDTO> itens) {
        this.itens = itens;
    }
}
