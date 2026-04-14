package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.ProdutoRequestDTO;
import br.com.campushop.campushop_backend.dto.ProdutoResponseDTO;
import br.com.campushop.campushop_backend.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoRestController {

    private final ProdutoService produtoService;

    public ProdutoRestController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> criar(@Valid @RequestBody ProdutoRequestDTO request,
            Authentication authentication) {
        ProdutoResponseDTO response = produtoService.criarProduto(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/meus")
    public ResponseEntity<List<ProdutoResponseDTO>> listarMeus(Authentication authentication) {
        return ResponseEntity.ok(produtoService.listarProdutosDoVendedor(authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizar(@PathVariable Long id,
            @Valid @RequestBody ProdutoRequestDTO request,
            Authentication authentication) {
        return ResponseEntity.ok(produtoService.atualizarProduto(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
        produtoService.deletarProduto(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
