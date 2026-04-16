package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Produto; // Importando a classe Produto para usar nos métodos do controller
import br.com.campushop.campushop_backend.model.Usuario; // Importando a classe Usuario
import br.com.campushop.campushop_backend.service.ProdutoService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired; // Importando a anotação @Autowired para injetar o ProdutoRepository
import org.springframework.http.ResponseEntity; // Importando ResponseEntity para retornar respostas HTTP adequadas
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*; // Importando as anotações para criar endpoints REST

import jakarta.annotation.Nullable;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private UsuarioService usuarioService;

    // 1. Ler todos (Read)
    @GetMapping
    public List<Produto> listarTodos() {
        return produtoService.listarTodos();
    }

    // 1.1. Ler produtos do usuário logado
    @GetMapping("/usuario")
    public List<Produto> listarMeus(Authentication authentication) {
        String email = authentication.getName();
        return produtoService.listarPorUsuario(email);
    }

    // 2. Ler por ID (Read)
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Integer id) {
        return produtoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Criar novo produto (Create)
    @PostMapping
    public Produto salvar(@RequestBody Produto produto, Authentication authentication) {
        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);
        if (usuarioOpt.isPresent()) {
            produto.setUsuario(usuarioOpt.get());
        }
        return produtoService.salvar(produto);
    }

    // 4. Atualizar produto existente (Update) - NOVO!
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Integer id,
            @RequestBody Produto produtoAtualizado) {
        try {
            Produto produto = produtoService.atualizar(id, produtoAtualizado);
            return ResponseEntity.ok(produto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 5. Marcar como inativo (Soft Delete)
    @DeleteMapping("/{id}/inativo")
    public ResponseEntity<Void> marcarInativo(@PathVariable Integer id) {
        try {
            produtoService.marcarComoInativo(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 6. Marcar como fora de estoque
    @DeleteMapping("/{id}/fora-estoque")
    public ResponseEntity<Void> marcarForaEstoque(@PathVariable Integer id) {
        try {
            produtoService.marcarComoForaDeEstoque(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 7. Deletar produto (hard delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        try {
            produtoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}