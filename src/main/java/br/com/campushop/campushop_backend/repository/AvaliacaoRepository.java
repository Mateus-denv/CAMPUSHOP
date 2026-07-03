package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para acesso aos dados de avaliações.
 * Fornece queries personalizadas para busca de avaliações por produto, usuário e status.
 */
@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    // Busca todas as avaliações ativas de um produto — para exibir na página do produto
    @Query("SELECT a FROM Avaliacao a WHERE a.produto.idProduto = :idProduto AND a.status = 'ATIVA' ORDER BY a.dataAvaliacao DESC")
    List<Avaliacao> findByProdutoIdAtivasOrdenadas(@Param("idProduto") Integer idProduto);

    // Busca todas as avaliações de um usuário (comprador) — para histórico de avaliações do usuário
    @Query("SELECT a FROM Avaliacao a WHERE a.usuario.id = :idUsuario AND a.status = 'ATIVA' ORDER BY a.dataAvaliacao DESC")
    List<Avaliacao> findByUsuarioId(@Param("idUsuario") Integer idUsuario);

    // Verifica se um usuário já avaliou um produto específico — evita avaliações duplicadas
    @Query("SELECT COUNT(a) > 0 FROM Avaliacao a WHERE a.produto.idProduto = :idProduto AND a.usuario.id = :idUsuario AND a.status = 'ATIVA'")
    boolean existeAvaliacaoAtivaDoProdutoPorUsuario(@Param("idProduto") Integer idProduto, @Param("idUsuario") Integer idUsuario);

    // Busca uma avaliação específica verificando se pertence ao usuário logado
    @Query("SELECT a FROM Avaliacao a WHERE a.idAvaliacao = :idAvaliacao AND a.usuario.id = :idUsuario")
    Optional<Avaliacao> findByIdAndUsuarioId(@Param("idAvaliacao") Integer idAvaliacao, @Param("idUsuario") Integer idUsuario);

    // Calcula a nota média de um produto — retorna 0.0 se não houver avaliações
    @Query("SELECT COALESCE(AVG(a.nota), 0.0) FROM Avaliacao a WHERE a.produto.idProduto = :idProduto AND a.status = 'ATIVA'")
    Double calcularNotaMediaProduto(@Param("idProduto") Integer idProduto);

    // Conta quantas avaliações ativas um produto tem — para exibir no card do produto
    @Query("SELECT COUNT(a) FROM Avaliacao a WHERE a.produto.idProduto = :idProduto AND a.status = 'ATIVA'")
    Long contarAvaliacoesAtivas(@Param("idProduto") Integer idProduto);
}
