package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Produto; // Importando a classe Produto para usar nos métodos do controller
import br.com.campushop.campushop_backend.model.Usuario; // Importando a classe Usuario
import br.com.campushop.campushop_backend.service.ProdutoService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired; // Importando a anotação @Autowired para injetar o ProdutoRepository
import org.springframework.http.ResponseEntity; // Importando ResponseEntity para retornar respostas HTTP adequadas
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*; // Importando as anotações para criar endpoints REST

import jakarta.annotation.Nullable;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private UsuarioService usuarioService;

    // DTO pequeno para devolver exatamente os campos usados pela tela de produtos/carrinho.
    public record ProdutoResponse(
            Integer idProduto,
            String nomeProduto,
            String descricao,
            Integer estoque,
            Double preco,
            Integer vendedor_id,
            String nomeVendedor) {

        public static ProdutoResponse fromEntity(Produto produto) {
            // Resolve o nome do anunciante direto do usuário associado ao produto.
            Usuario usuario = produto.getUsuario();
            return new ProdutoResponse(
                    produto.getIdProduto(),
                    produto.getNomeProduto(),
                    produto.getDescricao(),
                    produto.getEstoque(),
                    produto.getPreco(),
                    usuario != null ? usuario.getId() : null,
                    usuario != null ? usuario.getNomeCompleto() : null);
        }
    }

    // 1. Ler todos (Read)
    @GetMapping
    public List<ProdutoResponse> listarTodos() {
        // Retorna um payload estável para o frontend não depender da serialização da entidade.
        return produtoService.listarTodos().stream()
                .map(ProdutoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // 1.1. Ler produtos do usuário logado
    @GetMapping("/usuario")
    public List<ProdutoResponse> listarMeus(Authentication authentication) {
        String email = authentication.getName();
        // Mantém a mesma estrutura de resposta da listagem pública.
        return produtoService.listarPorUsuario(email).stream()
                .map(ProdutoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // 2. Ler por ID (Read)
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Integer id) {
        return produtoService.buscarPorId(id)
                // Expõe o mesmo formato da listagem para simplificar o consumo no frontend.
                .map(produto -> ResponseEntity.ok(ProdutoResponse.fromEntity(produto)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Criar novo produto (Create)
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Produto produto, Authentication authentication) {
        try {
            // Validações
            if (produto.getNomeProduto() == null || produto.getNomeProduto().trim().isEmpty()) {
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "Nome do produto é obrigatório");
                return ResponseEntity.badRequest().body(erro);
            }
            if (produto.getDescricao() == null || produto.getDescricao().trim().isEmpty()) {
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "Descrição é obrigatória");
                return ResponseEntity.badRequest().body(erro);
            }
            if (produto.getEstoque() == null || produto.getEstoque() < 0) {
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "Estoque deve ser um número não-negativo");
                return ResponseEntity.badRequest().body(erro);
            }
            if (produto.getPreco() == null || produto.getPreco() <= 0) {
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "Preço deve ser maior que zero");
                return ResponseEntity.badRequest().body(erro);
            }
            if (produto.getCategoria() == null) {
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "Categoria é obrigatória");
                return ResponseEntity.badRequest().body(erro);
            }

            String email = authentication.getName();
            Optional<Usuario> usuarioOpt = usuarioService.buscarPorEmail(email);
            if (usuarioOpt.isEmpty()) {
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro);
            }

            produto.setUsuario(usuarioOpt.get());
            Produto produtoSalvo = produtoService.salvar(produto);
            return ResponseEntity.status(HttpStatus.CREATED).body(produtoSalvo);
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().body(erro);
        } catch (Exception e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao salvar produto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
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