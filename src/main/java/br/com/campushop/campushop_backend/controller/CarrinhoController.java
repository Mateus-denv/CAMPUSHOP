package br.com.campushop.campushop_backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.campushop.campushop_backend.dto.PedidoFinalizacaoRequest;
import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.CarrinhoService;
import br.com.campushop.campushop_backend.service.PedidoService;
import br.com.campushop.campushop_backend.service.ProdutoService;
import br.com.campushop.campushop_backend.service.UsuarioService;

@RestController
@RequestMapping("/api/carrinho")
public class CarrinhoController {

    @Autowired
    private CarrinhoService carrinhoService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private ProdutoService produtoService;

    // 1. Listar itens do carrinho do usuário
    @GetMapping
    public ResponseEntity<List<Carrinho>> listarCarrinho(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Carrinho> itens = carrinhoService.listarPorUsuario(usuarioOpt.get().getId());
        return ResponseEntity.ok(itens);
    }

    // 2. Adicionar item ao carrinho
    @PostMapping("/adicionar")
    public ResponseEntity<?> adicionarAoCarrinho(
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {

        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Integer produtoId = request.get("produtoId");
        Integer quantidade = request.getOrDefault("quantidade", 1);

        if (produtoId == null || quantidade == null || quantidade <= 0) {
            return ResponseEntity.badRequest()
                    .<Map<String, String>>body(
                            Map.of("message", "Produto e quantidade são obrigatórios e devem ser válidos."));
        }

        Optional<Produto> produtoOpt = produtoService.buscarPorId(produtoId);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.badRequest().<Map<String, String>>body(Map.of("message", "Produto não encontrado."));
        }

        Carrinho item = carrinhoService.adicionarAoCarrinho(
                usuarioOpt.get().getId(),
                produtoOpt.get(),
                quantidade);

        return ResponseEntity.ok(item);
    }

    // 3. Remover item do carrinho
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerDoCarrinho(
            @PathVariable Integer id,
            Authentication authentication) {

        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        carrinhoService.removerDoCarrinho(id, usuarioOpt.get().getId());
        return ResponseEntity.noContent().build();
    }

    // 4. Atualizar quantidade de item
    @PutMapping("/{id}")
    public ResponseEntity<Carrinho> atualizarQuantidade(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {

        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Integer quantidade = request.get("quantidade");
        Carrinho item = carrinhoService.atualizarQuantidade(id, quantidade, usuarioOpt.get().getId());

        return ResponseEntity.ok(item);
    }

    // 5. Limpar carrinho inteiro
    @DeleteMapping
    public ResponseEntity<Void> limparCarrinho(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        carrinhoService.limparCarrinho(usuarioOpt.get().getId());
        return ResponseEntity.noContent().build();
    }

    // 6. Obter total do carrinho
    @GetMapping("/total")
    public ResponseEntity<Map<String, Double>> obterTotal(Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Double total = carrinhoService.calcularTotal(usuarioOpt.get().getId());
        Map<String, Double> response = new java.util.HashMap<>();
        response.put("total", total);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/finalizar")
    public ResponseEntity<?> finalizarPedido(
            @RequestBody PedidoFinalizacaoRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (request.getEndereco() == null || request.getEndereco().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Endereço é obrigatório para finalizar o pedido."));
        }

        if (request.getTelefone() == null || request.getTelefone().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Telefone é obrigatório para finalizar o pedido."));
        }

        var pedido = pedidoService.criarPedido(usuarioOpt.get().getId(), request.getEndereco(), request.getTelefone());
        return ResponseEntity.status(201).body(Map.of(
                "id", pedido.getId(),
                "status", pedido.getStatus().name(),
                "total", pedido.getTotal()));
    }
}
