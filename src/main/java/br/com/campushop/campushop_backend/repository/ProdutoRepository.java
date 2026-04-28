package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    List<Produto> findByStatus(String status);

    // Carrega o usuário junto do produto para o nome do anunciante ficar disponível no retorno.
    @Query("SELECT p FROM Produto p LEFT JOIN FETCH p.usuario")
    List<Produto> findAllComUsuario();

    // Faz o mesmo carregamento no filtro por usuário logado para manter o payload consistente.
    @Query("SELECT p FROM Produto p LEFT JOIN FETCH p.usuario WHERE p.usuario.email = :email")
    List<Produto> findByUsuarioEmail(@Param("email") String email);
}