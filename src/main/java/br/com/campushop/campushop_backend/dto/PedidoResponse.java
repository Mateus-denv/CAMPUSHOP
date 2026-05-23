package br.com.campushop.campushop_backend.dto;

import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;

import java.math.BigDecimal;
import java.util.List;

public record PedidoResponse(
        Integer id,
        String chaveAcesso,
        String status,
        String motivoRejeicao,
        String criadoEm,
        PedidoPartyResponse comprador,
        PedidoPartyResponse vendedor,
        List<PedidoItemResponse> itens,
        BigDecimal total) {

    public static PedidoResponse fromEntity(Pedido pedido) {
        return new PedidoResponse(
                pedido.getIdPedido(),
                pedido.getChaveEntrega(),
                pedido.getStatusPedido(),
                pedido.getMotivoRejeicao(),
                pedido.getDataPedido() != null ? pedido.getDataPedido().toString() : null,
                new PedidoPartyResponse(
                        pedido.getUsuario() != null ? pedido.getUsuario().getId() : null,
                        pedido.getUsuario() != null ? pedido.getUsuario().getNomeCompleto() : null,
                        pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : null,
                        pedido.getUsuario() != null ? pedido.getUsuario().getTipoConta() : null),
                new PedidoPartyResponse(
                        pedido.getVendedor() != null ? pedido.getVendedor().getId() : null,
                        pedido.getVendedor() != null ? pedido.getVendedor().getNomeCompleto() : null,
                        pedido.getVendedor() != null ? pedido.getVendedor().getEmail() : null,
                        pedido.getVendedor() != null ? pedido.getVendedor().getTipoConta() : null),
                pedido.getItens().stream().map(PedidoResponse::toItemResponse).toList(),
                pedido.getValorPedido());
    }

    private static PedidoItemResponse toItemResponse(PedidoItem item) {
        return new PedidoItemResponse(
                item.getProduto() != null ? item.getProduto().getIdProduto() : null,
                item.getProduto() != null ? item.getProduto().getNomeProduto() : null,
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getProduto() != null && item.getProduto().getUsuario() != null ? item.getProduto().getUsuario().getId() : null,
                item.getProduto() != null && item.getProduto().getUsuario() != null ? item.getProduto().getUsuario().getNomeCompleto() : null);
    }
}