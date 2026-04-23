package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Categoria;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.CategoriaRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.validation.ProdutoValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private static final Logger logger = LoggerFactory.getLogger(ProdutoService.class);

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoValidator produtoValidator;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository,
            ProdutoValidator produtoValidator) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.produtoValidator = produtoValidator;
    }

    public Produto salvar(Produto produto) {
        logger.info("Tentando salvar produto: {}", produto.getNomeProduto());

        // Carregar a Categoria completa pelo ID se fornecida
        if (produto.getCategoria() != null && produto.getCategoria().getIdCategoria() != null) {
            Optional<Categoria> categoriaOpt = categoriaRepository.findById(produto.getCategoria().getIdCategoria());
            if (categoriaOpt.isPresent()) {
                produto.setCategoria(categoriaOpt.get());
            } else {
                throw new RuntimeException(
                        "Categoria com ID " + produto.getCategoria().getIdCategoria() + " não encontrada");
            }
        } else {
            throw new RuntimeException("Categoria é obrigatória para o produto");
        }

        // Validações
        produtoValidator.validarProduto(produto);

        Produto salvo = produtoRepository.save(produto);

        logger.info("Produto salvo com sucesso! ID: {}", salvo.getIdProduto());

        return salvo;
    }

    public List<Produto> listarTodos() {
        // Busca os produtos com o usuário carregado para expor o nome do anunciante sem LazyInitialization.
        return produtoRepository.findAllComUsuario();
    }

    public List<Produto> listarPorUsuario(String email) {
        // Mantém o usuário do produto carregado também nesta listagem filtrada.
        return produtoRepository.findByUsuarioEmail(email);
    }

    public Optional<Produto> buscarPorId(Integer id) {
        return produtoRepository.findById(id);
    }

    public Produto atualizar(Integer id, Produto produtoAtualizado) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produtoExistente = produtoOpt.get();

            produtoExistente.setNomeProduto(produtoAtualizado.getNomeProduto());
            produtoExistente.setDescricao(produtoAtualizado.getDescricao());
            produtoExistente.setEstoque(produtoAtualizado.getEstoque());
            produtoExistente.setPreco(produtoAtualizado.getPreco());
            produtoExistente.setStatus(produtoAtualizado.getStatus());
            produtoExistente.setDimensoes(produtoAtualizado.getDimensoes());
            produtoExistente.setPeso(produtoAtualizado.getPeso());

            // Carregar a Categoria completa se fornecida
            if (produtoAtualizado.getCategoria() != null && produtoAtualizado.getCategoria().getIdCategoria() != null) {
                Optional<Categoria> categoriaOpt = categoriaRepository
                        .findById(produtoAtualizado.getCategoria().getIdCategoria());
                if (categoriaOpt.isPresent()) {
                    produtoExistente.setCategoria(categoriaOpt.get());
                }
            }

            // Validações
            produtoValidator.validarProduto(produtoExistente);

            Produto salvo = produtoRepository.save(produtoExistente);
            logger.info("Produto atualizado com sucesso! ID: {}", id);
            return salvo;
        } else {
            throw new RuntimeException("Produto não encontrado");
        }
    }

    public void marcarComoInativo(Integer id) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produto = produtoOpt.get();
            produto.setStatus("INATIVO");
            produtoRepository.save(produto);
            logger.info("Produto marcado como inativo! ID: {}", id);
        } else {
            throw new RuntimeException("Produto não encontrado");
        }
    }

    public void marcarComoForaDeEstoque(Integer id) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produto = produtoOpt.get();
            produto.setEstoque(0);
            produto.setStatus("FORA_DE_ESTOQUE");
            produtoRepository.save(produto);
            logger.info("Produto marcado como fora de estoque! ID: {}", id);
        } else {
            throw new RuntimeException("Produto não encontrado");
        }
    }

    public void deletar(Integer id) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            produtoRepository.deleteById(id);
            logger.info("Produto deletado com sucesso! ID: {}", id);
        } else {
            throw new RuntimeException("Produto não encontrado");
        }
    }
}
