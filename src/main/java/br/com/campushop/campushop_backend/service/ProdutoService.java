package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Categoria;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.CategoriaRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.validation.ProdutoValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

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

        if (Boolean.TRUE.equals(produto.getPossuiVariantes())) {
            validarVariantesCadastro(produto);
        }

        Produto salvo = produtoRepository.save(produto);

        if (Boolean.TRUE.equals(salvo.getPossuiVariantes())) {
            salvarVariantes(salvo, produto.getVariantes());
            recalcularResumoDoPai(salvo);
            salvo = produtoRepository.findByIdComUsuario(salvo.getIdProduto()).stream().findFirst().orElse(salvo);
        }

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

    public List<Produto> listarVariantes(Integer produtoPaiId) {
        // Busca as variantes pelo relacionamento pai para manter o contrato do JPA consistente.
        return produtoRepository.findByProdutoPai_IdProdutoOrderByIdProdutoAsc(produtoPaiId);
    }

    public Optional<Produto> buscarPorId(Integer id) {
        return produtoRepository.findByIdComUsuario(id).stream().findFirst();
    }

    public Produto atualizar(Integer id, Produto produtoAtualizado) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produtoExistente = produtoOpt.get();

            if (produtoExistente.getProdutoPai() != null) {
                throw new RuntimeException("Não é permitido editar uma variante diretamente");
            }

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
            if (produtoAtualizado.getPossuiVariantes() != null) {
                produtoExistente.setPossuiVariantes(produtoAtualizado.getPossuiVariantes());
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

            if (Boolean.TRUE.equals(produtoExistente.getPossuiVariantes())) {
                produtoExistente.setEhVariacao(Boolean.FALSE);
                produtoExistente.setProdutoPai(null);
            }

            Produto salvo = produtoRepository.save(produtoExistente);

            if (Boolean.TRUE.equals(salvo.getPossuiVariantes()) && produtoAtualizado.getVariantes() != null && !produtoAtualizado.getVariantes().isEmpty()) {
                // Remove as variantes filhas antes de excluir o anúncio principal.
                produtoRepository.deleteByProdutoPai_IdProduto(salvo.getIdProduto());
                salvarVariantes(salvo, produtoAtualizado.getVariantes());
                recalcularResumoDoPai(salvo);
                salvo = produtoRepository.findByIdComUsuario(salvo.getIdProduto()).stream().findFirst().orElse(salvo);
            }

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
        if (produto.getProdutoPai() != null) {
            return estaDisponivelParaComprador(produto.getProdutoPai());
        }

        String status = produto.getStatus() == null ? STATUS_ATIVO : produto.getStatus().trim().toUpperCase();
        return !STATUS_INATIVO.equals(status) && Boolean.TRUE.equals(produto.getVisivelParaComprador());
    }

    public boolean possuiVariantes(Integer produtoId) {
        // Confere se existem registros filhos vinculados ao anúncio principal.
        return produtoRepository.countByProdutoPai_IdProduto(produtoId) > 0;
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

    private void validarVariantesCadastro(Produto produto) {
        if (produto.getVariantes() == null || produto.getVariantes().isEmpty()) {
            throw new RuntimeException("Informe ao menos uma variante para este anúncio");
        }

        for (Produto variante : produto.getVariantes()) {
            if (variante.getNomeProduto() == null || variante.getNomeProduto().trim().isEmpty()) {
                throw new RuntimeException("Cada variante precisa ter um nome");
            }
            if (variante.getEstoque() == null || variante.getEstoque() < 0) {
                throw new RuntimeException("O estoque de cada variante deve ser um número válido");
            }
            if (variante.getPreco() == null || variante.getPreco() <= 0) {
                throw new RuntimeException("O preço de cada variante deve ser um valor positivo");
            }
        }
    }

    private void salvarVariantes(Produto produtoPai, List<Produto> variantes) {
        List<Produto> variantesSalvas = new ArrayList<>();

        for (Produto variante : variantes) {
            variante.setIdProduto(null);
            variante.setEhVariacao(Boolean.TRUE);
            variante.setPossuiVariantes(Boolean.FALSE);
            variante.setProdutoPai(produtoPai);
            variante.setUsuario(produtoPai.getUsuario());
            variante.setCategoria(produtoPai.getCategoria());
            variante.setDescricao(produtoPai.getDescricao());
            variante.setPeso(produtoPai.getPeso());
            variante.setDimensoes(produtoPai.getDimensoes());
            variante.setDimensaoComprimento(produtoPai.getDimensaoComprimento());
            variante.setDimensaoLargura(produtoPai.getDimensaoLargura());
            if (variante.getStatus() == null || variante.getStatus().trim().isEmpty()) {
                variante.setStatus(produtoPai.getStatus());
            }
            if (variante.getVisivelParaComprador() == null) {
                variante.setVisivelParaComprador(produtoPai.getVisivelParaComprador());
            }
            if (variante.getTipoProduto() == null || variante.getTipoProduto().trim().isEmpty()) {
                variante.setTipoProduto(produtoPai.getTipoProduto());
            }
            if (variante.getUsaDimensoes() == null) {
                variante.setUsaDimensoes(produtoPai.getUsaDimensoes());
            }

            produtoValidator.validarProduto(variante);
            variantesSalvas.add(produtoRepository.save(variante));
        }

        produtoPai.setVariantes(variantesSalvas);
    }

    private void recalcularResumoDoPai(Produto produtoPai) {
        List<Produto> variantesSalvas = listarVariantes(produtoPai.getIdProduto());
        if (variantesSalvas.isEmpty()) {
            return;
        }

        int estoqueTotal = variantesSalvas.stream().mapToInt(variante -> variante.getEstoque() == null ? 0 : variante.getEstoque()).sum();
        double menorPreco = variantesSalvas.stream()
                .map(Produto::getPreco)
                .filter(preco -> preco != null)
                .mapToDouble(Double::doubleValue)
                .min()
                .orElse(produtoPai.getPreco() != null ? produtoPai.getPreco() : 0D);

        produtoPai.setEstoque(estoqueTotal);
        produtoPai.setPreco(menorPreco);
        produtoRepository.save(produtoPai);
    }
}
