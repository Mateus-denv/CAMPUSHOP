package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List; // IMPORTANTE: faltava esse cara!

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    List<Produto> findByStatus(String status);

    // Carrega apenas os produtos que realmente podem aparecer para compradores.
    @Query("SELECT p FROM Produto p LEFT JOIN FETCH p.usuario WHERE p.produtoPai IS NULL AND COALESCE(UPPER(p.status), 'ATIVO') <> 'INATIVO' AND COALESCE(p.visivelParaComprador, true) = true")
    List<Produto> findAllDisponiveis();

    // Faz o mesmo carregamento no filtro por usuário logado para manter o payload consistente.
    @Query("SELECT p FROM Produto p LEFT JOIN FETCH p.usuario WHERE p.produtoPai IS NULL AND p.usuario.email = :email")
    List<Produto> findByUsuarioEmail(@Param("email") String email);

    // Garante o nome do anunciante também no detalhe sem perder acesso aos produtos do dono.
    @Query("SELECT p FROM Produto p LEFT JOIN FETCH p.usuario LEFT JOIN FETCH p.produtoPai WHERE p.idProduto = :id")
    List<Produto> findByIdComUsuario(@Param("id") Integer id);

    // Localiza todas as variantes de um anúncio principal usando o id do relacionamento pai.
    List<Produto> findByProdutoPai_IdProdutoOrderByIdProdutoAsc(Integer produtoPaiId);

    // Conta as variantes filhas do anúncio principal para validar regras de imagem e remoção.
    long countByProdutoPai_IdProduto(Integer produtoPaiId);

    // Remove todas as variantes filhas quando o anúncio principal é excluído.
    void deleteByProdutoPai_IdProduto(Integer produtoPaiId);
}