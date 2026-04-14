package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Categoria;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.CategoriaRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class CadastrarProdutoController {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;

    public CadastrarProdutoController(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("/cadastrar-produto")
    public String cadastroProdutoForm(Model model) {
        model.addAttribute("titulo", "CampusShop - Cadastrar Produto");

        Produto produtoNovo = new Produto();
        produtoNovo.setCategoria(new Categoria());

        model.addAttribute("produto", produtoNovo);
        model.addAttribute("categorias", categoriaRepository.findAll());
        return "cadastrar-produto";
    }

    @PostMapping("/cadastrar-produto")
    public String cadastrar(Produto produto, RedirectAttributes redirectAttributes) {

        if (produto.getCategoria() != null && produto.getCategoria().getIdCategoria() == null) {
            produto.setCategoria(null);
        }

        if (produto.getNomeProduto() == null || produto.getNomeProduto().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("erro", "O nome do produto é obrigatório para cadastro");
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }

        if (produto.getPreco() == null || produto.getPreco() <= 0) {
            redirectAttributes.addFlashAttribute("erro", "O preço do produto deve ser maior que zero");
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }

        if (produto.getEstoque() == null || produto.getEstoque() < 0) {
            redirectAttributes.addFlashAttribute("erro", "O estoque não pode ter valor negativo");
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }

        try {
            if (produto.getStatus() == null || produto.getStatus().isEmpty()) {
                produto.setStatus("ATIVO");
            }

            produtoRepository.save(produto);
            redirectAttributes.addFlashAttribute("sucesso", "Produto cadastrado com sucesso no sistema!");
            return "redirect:/cadastrar-produto";

        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("erro", "Erro ao salvar produto: " + e.getMessage());
            redirectAttributes.addFlashAttribute("produto", produto);
            return "redirect:/cadastrar-produto";
        }
    }
}
