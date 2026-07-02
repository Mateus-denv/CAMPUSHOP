package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Avaliacao;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.AvaliacaoRepository;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import br.com.campushop.campushop_backend.validation.AvaliacaoValidator;
import br.com.campushop.campushop_backend.dto.AvaliacaoRequest;
import br.com.campushop.campushop_backend.dto.AvaliacaoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service para gerenciar avaliações de produtos.
 * Implementa validações de nota (1-10), feedback (máximo 500 caracteres)
 * e regras de negócio (uma avaliação por usuário/produto).
 */
@Service
public class AvaliacaoService {

    private static final Logger logger = LoggerFactory.getLogger(AvaliacaoService.class);

    private final AvaliacaoRepository avaliacaoRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoValidator avaliacaoValidator;

    @Autowired
    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                           PedidoRepository pedidoRepository,
                           ProdutoRepository produtoRepository,
                           UsuarioRepository usuarioRepository,
                           AvaliacaoValidator avaliacaoValidator) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
        this.avaliacaoValidator = avaliacaoValidator;
    }

    /**
     * Cria uma nova avaliação para um produto.
     * Valida: nota entre 1-10, feedback máximo 500 caracteres, produto e usuário existem.
     * Impede avaliações duplicadas do mesmo usuário para o mesmo produto.
     */
    @Transactional
    public AvaliacaoResponse criarAvaliacao(AvaliacaoRequest request, Integer idUsuario) {
        logger.info("Criando avaliação para produto {} pelo usuário {}", request.getIdProduto(), idUsuario);

        // Usar o validator para validação centralizada de nota e feedback
        avaliacaoValidator.validarNota(request.getNota());
        avaliacaoValidator.validarFeedback(request.getFeedback());

        // Validar que o produto existe
        Optional<Produto> produtoOpt = produtoRepository.findById(request.getIdProduto());
        if (produtoOpt.isEmpty()) {
            throw new RuntimeException("Produto com ID " + request.getIdProduto() + " não encontrado");
        }
        Produto produto = produtoOpt.get();

        // Validar que o usuário existe
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuário com ID " + idUsuario + " não encontrado");
        }
        Usuario usuario = usuarioOpt.get();

        // Verificar se o usuário já avaliou este produto — apenas uma avaliação por usuário/produto
        if (avaliacaoRepository.existeAvaliacaoAtivaDoProdutoPorUsuario(request.getIdProduto(), idUsuario)) {
            throw new IllegalArgumentException(
                "Você já avaliou este produto. Use a funcionalidade de atualização para modificar sua avaliação");
        }

        // Verificar se o usuário comprou e recebeu o produto antes de avaliar
        if (!usuarioPodeAvaliarProduto(request.getIdProduto(), idUsuario)) {
            throw new IllegalArgumentException(
                "Você só pode avaliar produtos após a conclusão da compra e entrega do pedido");
        }

        // Criar e salvar a avaliação
        Avaliacao avaliacao = new Avaliacao(produto, usuario, request.getNota(), request.getFeedback());
        avaliacao.setDataAvaliacao(LocalDateTime.now());
        avaliacao.setStatus("ATIVA");
        
        Avaliacao avaliacaoSalva = avaliacaoRepository.save(avaliacao);
        logger.info("Avaliação criada com sucesso: ID {}", avaliacaoSalva.getIdAvaliacao());

        return converterParaResponse(avaliacaoSalva);
    }

    /**
     * Atualiza uma avaliação existente.
     * Apenas o proprietário da avaliação pode atualizar.
     */
    @Transactional
    public AvaliacaoResponse atualizarAvaliacao(Integer idAvaliacao, AvaliacaoRequest request, Integer idUsuario) {
        logger.info("Atualizando avaliação {} pelo usuário {}", idAvaliacao, idUsuario);

        // Usar o validator para validação centralizada
        avaliacaoValidator.validarNota(request.getNota());
        avaliacaoValidator.validarFeedback(request.getFeedback());

        // Buscar avaliação e verificar se pertence ao usuário
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findByIdAndUsuarioId(idAvaliacao, idUsuario);
        if (avaliacaoOpt.isEmpty()) {
            throw new RuntimeException("Avaliação não encontrada ou você não tem permissão para atualizar");
        }

        Avaliacao avaliacao = avaliacaoOpt.get();
        // Atualizar apenas nota e feedback — data não muda
        avaliacao.setNota(request.getNota());
        avaliacao.setFeedback(request.getFeedback());
        
        Avaliacao avaliacaoAtualizada = avaliacaoRepository.save(avaliacao);
        logger.info("Avaliação atualizada com sucesso: ID {}", avaliacaoAtualizada.getIdAvaliacao());

        return converterParaResponse(avaliacaoAtualizada);
    }

    /**
     * Deleta uma avaliação (soft delete — apenas marca como INATIVA).
     * Apenas o proprietário pode deletar.
     */
    @Transactional
    public void deletarAvaliacao(Integer idAvaliacao, Integer idUsuario) {
        logger.info("Deletando avaliação {} pelo usuário {}", idAvaliacao, idUsuario);

        // Buscar avaliação e verificar se pertence ao usuário
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findByIdAndUsuarioId(idAvaliacao, idUsuario);
        if (avaliacaoOpt.isEmpty()) {
            throw new RuntimeException("Avaliação não encontrada ou você não tem permissão para deletar");
        }

        Avaliacao avaliacao = avaliacaoOpt.get();
        // Soft delete — marcar como INATIVA ao invés de deletar do banco
        avaliacao.setStatus("INATIVA");
        avaliacaoRepository.save(avaliacao);
        logger.info("Avaliação marcada como inativa: ID {}", idAvaliacao);
    }

    /**
     * Busca todas as avaliações ativas de um produto.
     * Retorna ordenadas por data mais recente primeiro.
     */
    public List<AvaliacaoResponse> buscarAvaliacoesProduto(Integer idProduto) {
        logger.info("Buscando avaliações do produto {}", idProduto);
        
        // Validar que o produto existe
        if (!produtoRepository.existsById(idProduto)) {
            throw new RuntimeException("Produto com ID " + idProduto + " não encontrado");
        }

        List<Avaliacao> avaliacoes = avaliacaoRepository.findByProdutoIdAtivasOrdenadas(idProduto);
        return avaliacoes.stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca todas as avaliações feitas por um usuário.
     */
    public List<AvaliacaoResponse> buscarAvaliacoesUsuario(Integer idUsuario) {
        logger.info("Buscando avaliações do usuário {}", idUsuario);

        // Validar que o usuário existe
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new RuntimeException("Usuário com ID " + idUsuario + " não encontrado");
        }

        List<Avaliacao> avaliacoes = avaliacaoRepository.findByUsuarioId(idUsuario);
        return avaliacoes.stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca uma avaliação específica.
     */
    public AvaliacaoResponse buscarAvaliacao(Integer idAvaliacao) {
        logger.info("Buscando avaliação {}", idAvaliacao);

        Avaliacao avaliacao = avaliacaoRepository.findById(idAvaliacao)
                .orElseThrow(() -> new RuntimeException("Avaliação com ID " + idAvaliacao + " não encontrada"));
        
        return converterParaResponse(avaliacao);
    }

    /**
     * Calcula a nota média de um produto.
     */
    public Double calcularNotaMediaProduto(Integer idProduto) {
        logger.info("Calculando nota média do produto {}", idProduto);

        // Validar que o produto existe
        if (!produtoRepository.existsById(idProduto)) {
            throw new RuntimeException("Produto com ID " + idProduto + " não encontrado");
        }

        return avaliacaoRepository.calcularNotaMediaProduto(idProduto);
    }

    /**
     * Conta quantas avaliações ativas um produto possui.
     */
    public Long contarAvaliacoesAtivas(Integer idProduto) {
        logger.info("Contando avaliações ativas do produto {}", idProduto);

        // Validar que o produto existe
        if (!produtoRepository.existsById(idProduto)) {
            throw new RuntimeException("Produto com ID " + idProduto + " não encontrado");
        }

        return avaliacaoRepository.contarAvaliacoesAtivas(idProduto);
    }

    /**
     * Verifica se o usuário pode avaliar este produto.
     * A avaliação só é permitida quando o comprador já recebeu o pedido entregue.
     * Retorna false caso o produto já tenha sido avaliado ou o pedido não tenha sido entregue.
     */
    public boolean usuarioPodeAvaliarProduto(Integer idProduto, Integer idUsuario) {
        logger.info("Verificando permissão de avaliação para produto {} e usuário {}", idProduto, idUsuario);

        if (!produtoRepository.existsById(idProduto)) {
            throw new RuntimeException("Produto com ID " + idProduto + " não encontrado");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário com ID " + idUsuario + " não encontrado"));

        if (avaliacaoRepository.existeAvaliacaoAtivaDoProdutoPorUsuario(idProduto, idUsuario)) {
            return false;
        }

        return pedidoRepository.existsPedidoEntreguePorCompradorEmailEProdutoId(usuario.getEmail(), idProduto);
    }

    /**
     * Converte uma entidade Avaliacao para AvaliacaoResponse DTO.
     */
    private AvaliacaoResponse converterParaResponse(Avaliacao avaliacao) {
        return new AvaliacaoResponse(
            avaliacao.getIdAvaliacao(),
            avaliacao.getProduto().getIdProduto(),
            avaliacao.getProduto().getNomeProduto(),
            avaliacao.getUsuario().getId(),
            avaliacao.getUsuario().getNomeCompleto(),
            avaliacao.getNota(),
            avaliacao.getFeedback(),
            avaliacao.getDataAvaliacao(),
            avaliacao.getStatus()
        );
    }
}
