package br.com.campushop.campushop_backend.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.campushop.campushop_backend.dto.PedidoEdicaoRequest;
import br.com.campushop.campushop_backend.dto.PedidoItemResponse;
import br.com.campushop.campushop_backend.dto.PedidoResponse;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.PedidoService;
import br.com.campushop.campushop_backend.service.UsuarioService;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarPedidos(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Pedido> pedidos = pedidoService.listarPedidosPorUsuario(usuarioOpt.get().getId());
        List<PedidoResponse> resposta = pedidos.stream()
                .map(this::mapearPedidoResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resposta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoResponse> editarPedido(
            @PathVariable Integer id,
            @RequestBody PedidoEdicaoRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pedido pedido = pedidoService.editarPedido(usuarioOpt.get().getId(), id, request.getItens());
        return ResponseEntity.ok(mapearPedidoResponse(pedido));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponse> cancelarPedido(
            @PathVariable Integer id,
            Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pedido pedido = pedidoService.cancelarPedido(usuarioOpt.get().getId(), id);
        return ResponseEntity.ok(mapearPedidoResponse(pedido));
    }

    private PedidoResponse mapearPedidoResponse(Pedido pedido) {
        PedidoResponse response = new PedidoResponse();
        response.setId(pedido.getId());
        response.setStatus(pedido.getStatus().name());
        response.setTotal(pedido.getTotal());
        response.setCriadoEm(pedido.getCriadoEm());
        response.setEndereco(pedido.getEndereco());
        response.setTelefone(pedido.getTelefone());
        response.setItens(pedido.getItens().stream().map(this::mapearItemResponse).collect(Collectors.toList()));
        return response;
    }

    private PedidoItemResponse mapearItemResponse(PedidoItem item) {
        PedidoItemResponse itemResponse = new PedidoItemResponse();
        itemResponse.setProdutoId(item.getProduto().getIdProduto());
        itemResponse.setNomeProduto(item.getProduto().getNomeProduto());
        itemResponse.setQuantidade(item.getQuantidade());
        itemResponse.setPrecoUnitario(item.getPrecoUnitario());
        return itemResponse;
    }
}
