package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Produto; // Importando a classe Produto para usar nos métodos do controller
import br.com.campushop.campushop_backend.repository.ProdutoRepository; // Importando o ProdutoRepository para acessar os dados dos produtos
import org.springframework.beans.factory.annotation.Autowired; // Importando a anotação @Autowired para injetar o ProdutoRepository
import org.springframework.http.ResponseEntity; // Importando ResponseEntity para retornar respostas HTTP adequadas
import org.springframework.web.bind.annotation.*; // Importando as anotações para criar endpoints REST

import jakarta.annotation.Nullable;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    // 1. Ler todos (Read)
    @GetMapping
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    // 2. Ler por ID (Read)
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Integer id) {
        return produtoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Criar novo produto (Create)
    @PostMapping
    public Produto salvar(@RequestBody Produto produto) {
        return produtoRepository.save(produto);
    }

    // 4. Atualizar produto existente (Update) - NOVO!
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Integer id,
            @RequestBody Produto produtoAtualizado) {
        return produtoRepository.findById(id)
                .map(produtoExistente -> {
                    produtoExistente.setNomeProduto(produtoAtualizado.getNomeProduto());
                    produtoExistente.setDescricao(produtoAtualizado.getDescricao());
                    produtoExistente.setEstoque(produtoAtualizado.getEstoque());
                    produtoExistente.setPreco(produtoAtualizado.getPreco());
                    produtoExistente.setStatus(produtoAtualizado.getStatus());
                    produtoExistente.setDimensoes(produtoAtualizado.getDimensoes());
                    produtoExistente.setPeso(produtoAtualizado.getPeso());
                    // Categoria precisa ser tratada com cuidado, mas para o básico faremos assim:
                    produtoExistente.setCategoria(produtoAtualizado.getCategoria());

                    Produto produtoSalvo = produtoRepository.save(produtoExistente);
                    return ResponseEntity.ok(produtoSalvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. Deletar produto (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        produtoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}