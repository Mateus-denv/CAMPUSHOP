package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Categoria;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.CategoriaRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class CadastrarProdutoController { // Adicionado 'Controller' no nome por convenção do Spring

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;

    public CadastrarProdutoController(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("/cadastrar-produto")
    public String cadastroProdutoForm(Model model) {
        model.addAttribute("titulo", "CampusShop - Cadastrar Produto");

        // CRIANDO O PRODUTO E INICIALIZANDO A CATEGORIA PARA NÃO DAR ERRO NA TELA
        Produto produtoNovo = new Produto();
        produtoNovo.setCategoria(new Categoria());

        model.addAttribute("produto", produtoNovo);
        model.addAttribute("categorias", categoriaRepository.findAll());
        return "cadastrar-produto";
    }

    @PostMapping("/cadastrar-produto")
    public String cadastrar(Produto produto, RedirectAttributes redirectAttributes) {

        // NOVO: TRATAMENTO DA CATEGORIA VAZIA
        // Se a categoria veio do HTML, mas o ID está vazio, definimos como nulo para o
        // banco de dados não reclamar
        if (produto.getCategoria() != null && produto.getCategoria().getIdCategoria() == null) {
            produto.setCategoria(null);
        }

        // 1. Validar Nome do Produto
        if (produto.getNomeProduto() == null || produto.getNomeProduto().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("erro", "O nome do produto é obrigatório para cadastro");
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }

        // 2. Validar Preço
        if (produto.getPreco() == null || produto.getPreco() <= 0) {
            redirectAttributes.addFlashAttribute("erro", "O preço do produto deve ser maior que zero");
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }

        // 3. Validar Estoque
        if (produto.getEstoque() == null || produto.getEstoque() < 0) {
            redirectAttributes.addFlashAttribute("erro", "O estoque não pode ter valor negativo");
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }

        try {
            // Preenchendo os dados automáticos (ex: Status padrão)
            if (produto.getStatus() == null || produto.getStatus().isEmpty()) {
                produto.setStatus("ATIVO");
            }

            produtoRepository.save(produto);
            redirectAttributes.addFlashAttribute("sucesso", "Produto cadastrado com sucesso no sistema!");

            // Redireciona para o próprio formulário limpo (ou poderia ser para uma lista)
            return "redirect:/cadastrar-produto";

        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("erro", "Erro ao salvar produto: " + e.getMessage());
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }
    }
}