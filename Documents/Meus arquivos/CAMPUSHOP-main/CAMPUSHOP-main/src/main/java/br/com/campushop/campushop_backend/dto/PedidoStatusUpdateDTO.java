package br.com.campushop.campushop_backend.dto;

import br.com.campushop.campushop_backend.enums.StatusPedido;
import jakarta.validation.constraints.NotNull;

public class PedidoStatusUpdateDTO {

    @NotNull(message = "Status é obrigatório")
    private StatusPedido status;

    public StatusPedido getStatus() {
        return status;
    }

    public void setStatus(StatusPedido status) {
        this.status = status;
    }
}
