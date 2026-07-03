package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.AvaliacaoRequest;
import br.com.campushop.campushop_backend.dto.AvaliacaoResponse;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import br.com.campushop.campushop_backend.service.AvaliacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller para gerenciar avaliações de produtos.
 * Expõe endpoints REST para criar, atualizar, deletar e listar avaliações.
 * Segue padrão RESTful com autenticação via Spring Security.
 */
@RestController
@RequestMapping("/api/avaliacoes")
@CrossOrigin(origins = "*")
public class AvaliacaoController {

    private static final Logger logger = LoggerFactory.getLogger(AvaliacaoController.class);

    @Autowired
    private AvaliacaoService avaliacaoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Endpoint: POST /api/avaliacoes
     * Cria uma nova avaliação de produto.
     * Requer autenticação do usuário logado.
     * 
     * Body esperado:
     * {
     *   "idProduto": 1,
     *   "nota": 8,
     *   "feedback": "Produto excelente, chegou rápido e bem embalado!"
     * }
     */
    @PostMapping
    public ResponseEntity<?> criarAvaliacao(@RequestBody AvaliacaoRequest request) {
        logger.info("Recebido request para criar avaliação: {}", request);

        try {
            // Extrair ID do usuário do contexto de segurança
            Integer idUsuario = extrairIdUsuarioLogado();
            
            // Criar avaliação através da service
            AvaliacaoResponse response = avaliacaoService.criarAvaliacao(request, idUsuario);
            
            logger.info("Avaliação criada com sucesso: {}", response.getIdAvaliacao());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            // Erro de validação (nota fora do intervalo, feedback muito longo, etc)
            logger.warn("Erro de validação ao criar avaliação: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
            
        } catch (RuntimeException e) {
            // Erro de negócio (produto não existe, avaliação duplicada, etc)
            logger.error("Erro ao criar avaliação: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
        }
    }

    /**
     * Endpoint: PUT /api/avaliacoes/{id}
     * Atualiza uma avaliação existente.
     * Apenas o proprietário da avaliação pode atualizar.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarAvaliacao(
            @PathVariable Integer id,
            @RequestBody AvaliacaoRequest request) {
        logger.info("Recebido request para atualizar avaliação {}: {}", id, request);

        try {
            Integer idUsuario = extrairIdUsuarioLogado();
            AvaliacaoResponse response = avaliacaoService.atualizarAvaliacao(id, request, idUsuario);
            
            logger.info("Avaliação atualizada com sucesso: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Erro de validação ao atualizar avaliação: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
            
        } catch (RuntimeException e) {
            logger.error("Erro ao atualizar avaliação: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
        }
    }

    /**
     * Endpoint: DELETE /api/avaliacoes/{id}
     * Deleta uma avaliação (soft delete — marca como INATIVA).
     * Apenas o proprietário pode deletar.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarAvaliacao(@PathVariable Integer id) {
        logger.info("Recebido request para deletar avaliação {}", id);

        try {
            Integer idUsuario = extrairIdUsuarioLogado();
            avaliacaoService.deletarAvaliacao(id, idUsuario);
            
            logger.info("Avaliação deletada com sucesso: {}", id);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Avaliação deletada com sucesso");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Erro ao deletar avaliação: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
        }
    }

    /**
     * Endpoint: GET /api/avaliacoes/produto/{idProduto}
     * Lista todas as avaliações ativas de um produto.
     * Ordenadas por data mais recente primeiro.
     * Não requer autenticação.
     */
    @GetMapping("/produto/{idProduto}")
    public ResponseEntity<?> listarAvaliacoesProduto(@PathVariable Integer idProduto) {
        logger.info("Buscando avaliações do produto {}", idProduto);

        try {
            List<AvaliacaoResponse> avaliacoes = avaliacaoService.buscarAvaliacoesProduto(idProduto);
            logger.info("Encontradas {} avaliações para o produto {}", avaliacoes.size(), idProduto);
            return ResponseEntity.ok(avaliacoes);
            
        } catch (RuntimeException e) {
            logger.error("Erro ao buscar avaliações do produto: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
        }
    }

    /**
     * Endpoint: GET /api/avaliacoes/usuario/{idUsuario}
     * Lista todas as avaliações feitas por um usuário.
     * Ordenadas por data mais recente primeiro.
     * Requer autenticação (o usuário pode ver apenas suas próprias avaliações).
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarAvaliacoesUsuario(@PathVariable Integer idUsuario) {
        logger.info("Buscando avaliações do usuário {}", idUsuario);

        try {
            Integer idUsuarioLogado = extrairIdUsuarioLogado();
            
            // Validar que o usuário só pode ver suas próprias avaliações
            if (!idUsuario.equals(idUsuarioLogado)) {
                logger.warn("Tentativa de acesso não autorizado às avaliações do usuário {}", idUsuario);
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "Você só pode visualizar suas próprias avaliações");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(erro);
            }
            
            List<AvaliacaoResponse> avaliacoes = avaliacaoService.buscarAvaliacoesUsuario(idUsuario);
            logger.info("Encontradas {} avaliações do usuário {}", avaliacoes.size(), idUsuario);
            return ResponseEntity.ok(avaliacoes);
            
        } catch (RuntimeException e) {
            logger.error("Erro ao buscar avaliações do usuário: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
        }
    }

    /**
     * Endpoint: GET /api/avaliacoes/{id}
     * Busca uma avaliação específica pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarAvaliacao(@PathVariable Integer id) {
        logger.info("Buscando avaliação {}", id);

        try {
            AvaliacaoResponse avaliacao = avaliacaoService.buscarAvaliacao(id);
            logger.info("Avaliação encontrada: {}", id);
            return ResponseEntity.ok(avaliacao);
            
        } catch (RuntimeException e) {
            logger.error("Erro ao buscar avaliação: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
        }
    }

    /**
     * Endpoint: GET /api/avaliacoes/produto/{idProduto}/media
     * Calcula e retorna a nota média de um produto.
     * Exemplo: 7.5 (média de todas as avaliações ativas)
     */
    @GetMapping("/produto/{idProduto}/media")
    public ResponseEntity<?> calcularNotaMedia(@PathVariable Integer idProduto) {
        logger.info("Calculando nota média do produto {}", idProduto);

        try {
            Double notaMedia = avaliacaoService.calcularNotaMediaProduto(idProduto);
            Long totalAvaliacoes = avaliacaoService.contarAvaliacoesAtivas(idProduto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("idProduto", idProduto);
            response.put("notaMedia", notaMedia);
            response.put("totalAvaliacoes", totalAvaliacoes);
            
            logger.info("Nota média calculada para produto {}: {}", idProduto, notaMedia);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Erro ao calcular nota média: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
        }
    }

    @GetMapping("/produto/{idProduto}/autorizada")
    public ResponseEntity<?> produtoPodeSerAvaliado(@PathVariable Integer idProduto) {
        logger.info("Verificando permissão de avaliação para o produto {}", idProduto);

        try {
            Integer idUsuario = extrairIdUsuarioLogado();
            boolean podeAvaliar = avaliacaoService.usuarioPodeAvaliarProduto(idProduto, idUsuario);

            Map<String, Object> response = new HashMap<>();
            response.put("podeAvaliar", podeAvaliar);
            response.put("motivo", podeAvaliar ? null : "Você só pode avaliar este produto após a entrega do pedido e caso não tenha avaliado antes.");

            logger.info("Permissão de avaliação para produto {}: {}", idProduto, podeAvaliar);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Erro ao verificar permissão de avaliação: {}", e.getMessage());
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
        }
    }

    /**
     * Método auxiliar para extrair o ID do usuário do contexto de segurança.
     * Recupera o email do usuário autenticado e busca seu ID no banco de dados.
     */
    private Integer extrairIdUsuarioLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Validar que o usuário está autenticado
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuário não autenticado");
        }

        // Extrair o email (nome de usuário) do contexto de segurança
        String email = authentication.getName();
        logger.debug("Buscando usuário pelo email: {}", email);
        
        // Buscar o usuário no banco de dados pelo email
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            logger.error("Usuário não encontrado com email: {}", email);
            throw new RuntimeException("Usuário não encontrado no sistema");
        }

        Integer idUsuario = usuarioOpt.get().getId();
        logger.debug("ID do usuário logado: {}", idUsuario);
        
        return idUsuario;
    }
}
