package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Produto; // Importando a classe Produto para usar nos métodos do controller
import br.com.campushop.campushop_backend.repository.ProdutoRepository; // Importando o ProdutoRepository para acessar os dados dos produtos
import org.springframework.beans.factory.annotation.Autowired; // Importando a anotação @Autowired para injetar o ProdutoRepository
import org.springframework.http.ResponseEntity; // Importando ResponseEntity para retornar respostas HTTP adequadas
import org.springframework.web.bind.annotation.*; // Importando as anotações para criar endpoints REST

import java.util.List; // Importando List para retornar listas de produtos

@RestController // Anotação para indicar que esta classe é um controller REST, ou seja, vai lidar com requisições HTTP e retornar respostas JSON
@RequestMapping("/produtos") // Define a rota base para todos os endpoints deste controller

public class ProdutoController {
    @Autowired
    private ProdutoRepository produtoRepository; // Injetando o ProdutoRepository para acessar os dados dos produtos no banco de dados

    // Listar todos os produtos (Para a Home)
    @GetMapping
    public List<Produto> listarTodos() {
        return produtoRepository.findAll(); // Retorna uma lista de todos os produtos cadastrados no banco de dados
    }

    // Salvar novo produto (Para o Cadastro de Produto)
    @PostMapping
    public Produto salvar(@RequestBody Produto produto) {
        return produtoRepository.save(produto);
    }

    // Buscar um produto específico pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Integer id) {
        return produtoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar produto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        produtoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}