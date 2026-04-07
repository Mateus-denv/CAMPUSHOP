package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;

    public ProdutoController(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @GetMapping
    public ResponseEntity<?> listarProdutos(@RequestParam(required = false) String busca) {
        List<Produto> produtos;

        if (busca != null && !busca.trim().isEmpty()) {
            produtos = produtoRepository.findByNomeContainingIgnoreCase(busca.trim());
        } else {
            produtos = produtoRepository.findAll();
        }

        List<Map<String, Object>> response = produtos.stream().map(produto -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", produto.getId());
            item.put("nome", produto.getNome());
            item.put("descricao", produto.getDescricao());
            item.put("preco", produto.getPreco());
            item.put("estoque", produto.getEstoque());
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
