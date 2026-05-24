package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Produto; // Importando a classe Produto para usar nos métodos do controller
import br.com.campushop.campushop_backend.model.ImagemAnexo;
import br.com.campushop.campushop_backend.model.Usuario; // Importando a classe Usuario
import br.com.campushop.campushop_backend.service.ProdutoService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import br.com.campushop.campushop_backend.service.ImagemService;
import org.springframework.beans.factory.annotation.Autowired; // Importando a anotação @Autowired para injetar o ProdutoRepository
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity; // Importando ResponseEntity para retornar respostas HTTP adequadas
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*; // Importando as anotações para criar endpoints REST
import org.springframework.web.multipart.MultipartFile;

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

    @Autowired
    private ImagemService imagemService;

    // DTO pequeno para devolver exatamente os campos usados pela tela de produtos/carrinho.
    public record ProdutoResponse(
            Integer idProduto,
            String nomeProduto,
            String descricao,
            Integer estoque,
            Double preco,
            String status,
            Boolean visivelParaComprador,
            Integer vendedor_id,
            String nomeVendedor,
            Integer categoriaId,
            String categoriaNome) {

        public static ProdutoResponse fromEntity(Produto produto) {
            // Resolve o nome do anunciante direto do usuário associado ao produto.
            Usuario usuario = produto.getUsuario();
            var categoria = produto.getCategoria();
            return new ProdutoResponse(
                    produto.getIdProduto(),
                    produto.getNomeProduto(),
                    produto.getDescricao(),
                    produto.getEstoque(),
                    produto.getPreco(),
                    produto.getStatus(),
                    produto.getVisivelParaComprador(),
                    usuario != null ? usuario.getId() : null,
                    usuario != null ? usuario.getNomeCompleto() : null,
                    categoria != null ? categoria.getIdCategoria() : null,
                    categoria != null ? categoria.getNome_categoria() : null);
        }
    }

    public record AtualizarStatusProdutoRequest(String status) {}

    public record AtualizarVisibilidadeProdutoRequest(Boolean visivelParaComprador) {}

    public record ImagemResponse(Integer id, String nomeArquivo, String contentType, String url, String dataUpload) {}

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
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Integer id, Authentication authentication) {
        return produtoService.buscarPorId(id)
                .filter(produto -> {
                    if (authentication != null && authentication.isAuthenticated() && produto.getUsuario() != null) {
                        return authentication.getName().equalsIgnoreCase(produto.getUsuario().getEmail())
                                || produtoService.estaDisponivelParaComprador(produto);
                    }

                    return produtoService.estaDisponivelParaComprador(produto);
                })
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

    @PostMapping(value = "/{id}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> enviarImagens(@PathVariable Integer id,
            @RequestParam("imagens") List<MultipartFile> imagens,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Não autenticado"));
            }

            Produto produto = produtoService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            if (produto.getUsuario() == null || !authentication.getName().equalsIgnoreCase(produto.getUsuario().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("message", "Você não pode alterar imagens deste produto"));
            }

            List<ImagemAnexo> salvas = imagemService.salvarImagensProduto(produto, imagens);
            return ResponseEntity.ok(salvas.stream().map(this::toImagemResponse).collect(java.util.stream.Collectors.toList()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/imagens")
    public ResponseEntity<List<ImagemResponse>> listarImagens(@PathVariable Integer id) {
        try {
            List<ImagemResponse> imagens = imagemService.listarImagensProduto(id).stream()
                    .map(this::toImagemResponse)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(imagens);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/imagens/principal")
    public ResponseEntity<byte[]> obterImagemPrincipal(@PathVariable Integer id) {
        return imagemService.buscarImagemPrincipalProduto(id)
                .map(this::buildImageResponse)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/imagens/{imagemId}")
    public ResponseEntity<byte[]> obterImagem(@PathVariable Integer id, @PathVariable Integer imagemId) {
        return imagemService.buscarImagemProdutoPorId(id, imagemId)
                .map(this::buildImageResponse)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/imagens/{imagemId}")
    public ResponseEntity<Void> excluirImagem(@PathVariable Integer id, @PathVariable Integer imagemId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Produto produto = produtoService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            if (produto.getUsuario() == null || !authentication.getName().equalsIgnoreCase(produto.getUsuario().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            imagemService.excluirImagemProduto(id, imagemId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ProdutoResponse> atualizarStatus(@PathVariable Integer id,
            @RequestBody AtualizarStatusProdutoRequest request) {
        try {
            Produto produto = produtoService.atualizarStatus(id, request.status());
            return ResponseEntity.ok(ProdutoResponse.fromEntity(produto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/visibilidade")
    public ResponseEntity<ProdutoResponse> atualizarVisibilidade(@PathVariable Integer id,
            @RequestBody AtualizarVisibilidadeProdutoRequest request) {
        try {
            Produto produto = produtoService.atualizarVisibilidade(id, request.visivelParaComprador());
            return ResponseEntity.ok(ProdutoResponse.fromEntity(produto));
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

    private ImagemResponse toImagemResponse(ImagemAnexo imagem) {
        String url = imagem.getProduto() != null && imagem.getProduto().getIdProduto() != null
                ? "/api/produtos/" + imagem.getProduto().getIdProduto() + "/imagens/" + imagem.getId()
                : "/api/usuarios/" + imagem.getUsuario().getId() + "/foto";

        return new ImagemResponse(
                imagem.getId(),
                imagem.getNomeArquivo(),
                imagem.getContentType(),
                url,
                imagem.getDataUpload() != null ? imagem.getDataUpload().toString() : null);
    }

    private ResponseEntity<byte[]> buildImageResponse(ImagemAnexo imagem) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagem.getContentType()))
                .body(imagem.getDados());
    }
}