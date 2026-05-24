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

    private static final String STATUS_ATIVO = "ATIVO";
    private static final String STATUS_INATIVO = "INATIVO";
    private static final String STATUS_FORA_DE_ESTOQUE = "FORA_DE_ESTOQUE";

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

        // Produtos novos entram visíveis e ativos por padrão para manter o fluxo atual.
        if (produto.getStatus() == null || produto.getStatus().trim().isEmpty()) {
            produto.setStatus(STATUS_ATIVO);
        }
        if (produto.getVisivelParaComprador() == null) {
            produto.setVisivelParaComprador(Boolean.TRUE);
        }

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
        // A listagem pública mostra só o que está ativo e visível para compradores.
        return produtoRepository.findAllDisponiveis();
    }

    public List<Produto> listarPorUsuario(String email) {
        // Mantém o usuário do produto carregado também nesta listagem filtrada.
        return produtoRepository.findByUsuarioEmail(email);
    }

    public Optional<Produto> buscarPorId(Integer id) {
        return produtoRepository.findByIdComUsuario(id).stream().findFirst();
    }

    public Produto atualizar(Integer id, Produto produtoAtualizado) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produtoExistente = produtoOpt.get();

            // Atualiza só os campos enviados para não apagar conteúdo quando a edição vier parcial.
            if (produtoAtualizado.getNomeProduto() != null) {
                produtoExistente.setNomeProduto(produtoAtualizado.getNomeProduto());
            }
            if (produtoAtualizado.getDescricao() != null) {
                produtoExistente.setDescricao(produtoAtualizado.getDescricao());
            }
            if (produtoAtualizado.getEstoque() != null) {
                produtoExistente.setEstoque(produtoAtualizado.getEstoque());
            }
            if (produtoAtualizado.getPreco() != null) {
                produtoExistente.setPreco(produtoAtualizado.getPreco());
            }
            if (produtoAtualizado.getStatus() != null) {
                produtoExistente.setStatus(normalizarStatus(produtoAtualizado.getStatus()));
            }
            if (produtoAtualizado.getVisivelParaComprador() != null) {
                produtoExistente.setVisivelParaComprador(produtoAtualizado.getVisivelParaComprador());
            }
            if (produtoAtualizado.getDimensoes() != null) {
                produtoExistente.setDimensoes(produtoAtualizado.getDimensoes());
            }
            if (produtoAtualizado.getPeso() != null) {
                produtoExistente.setPeso(produtoAtualizado.getPeso());
            }

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

    public Produto atualizarStatus(Integer id, String status) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isEmpty()) {
            throw new RuntimeException("Produto não encontrado");
        }

        Produto produto = produtoOpt.get();
        produto.setStatus(normalizarStatus(status));
        produtoRepository.save(produto);
        logger.info("Status do produto atualizado! ID: {}", id);
        return produto;
    }

    public Produto atualizarVisibilidade(Integer id, Boolean visivelParaComprador) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isEmpty()) {
            throw new RuntimeException("Produto não encontrado");
        }

        Produto produto = produtoOpt.get();
        produto.setVisivelParaComprador(Boolean.TRUE.equals(visivelParaComprador));
        produtoRepository.save(produto);
        logger.info("Visibilidade do produto atualizada! ID: {}", id);
        return produto;
    }

    public void marcarComoInativo(Integer id) {
        atualizarStatus(id, STATUS_INATIVO);
    }

    public void marcarComoForaDeEstoque(Integer id) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produto = produtoOpt.get();
            produto.setEstoque(0);
            produto.setStatus(STATUS_FORA_DE_ESTOQUE);
            produtoRepository.save(produto);
            logger.info("Produto marcado como fora de estoque! ID: {}", id);
        } else {
            throw new RuntimeException("Produto não encontrado");
        }
    }

    public boolean estaDisponivelParaComprador(Produto produto) {
        String status = produto.getStatus() == null ? STATUS_ATIVO : produto.getStatus().trim().toUpperCase();
        return !STATUS_INATIVO.equals(status) && Boolean.TRUE.equals(produto.getVisivelParaComprador());
    }

    private String normalizarStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return STATUS_ATIVO;
        }

        String valorNormalizado = status.trim().toUpperCase();
        if (STATUS_ATIVO.equals(valorNormalizado) || STATUS_INATIVO.equals(valorNormalizado) || STATUS_FORA_DE_ESTOQUE.equals(valorNormalizado)) {
            return valorNormalizado;
        }

        throw new RuntimeException("Status de produto inválido");
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
