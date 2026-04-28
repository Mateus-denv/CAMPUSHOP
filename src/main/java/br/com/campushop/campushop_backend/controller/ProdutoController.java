package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.service.ProdutoService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final UsuarioService usuarioService;

    public ProdutoController(ProdutoService produtoService, UsuarioService usuarioService) {
        this.produtoService = produtoService;
        this.usuarioService = usuarioService;
    }

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
    public ResponseEntity<Produto> salvar(@RequestBody Produto produto, Authentication authentication) {
        String email = authentication.getName();
        var usuario = usuarioService.buscarPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        produto.setUsuario(usuario);
        Produto salvo = produtoService.salvar(produto);
        return ResponseEntity.ok(salvo);
    }

    // 4. Atualizar produto existente (Update)
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Integer id,
            @RequestBody Produto produtoAtualizado) {
        Produto atualizado = produtoService.atualizar(id, produtoAtualizado);
        return ResponseEntity.ok(atualizado);
    }

    // 5. Deletar produto (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
