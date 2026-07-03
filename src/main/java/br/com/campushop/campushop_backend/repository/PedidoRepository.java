package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.usuario LEFT JOIN FETCH p.vendedor LEFT JOIN FETCH p.itens i LEFT JOIN FETCH i.produto WHERE p.usuario.email = :email ORDER BY p.dataPedido DESC")
    List<Pedido> findByCompradorEmail(@Param("email") String email);

    @Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.usuario LEFT JOIN FETCH p.vendedor LEFT JOIN FETCH p.itens i LEFT JOIN FETCH i.produto WHERE p.vendedor.email = :email ORDER BY p.dataPedido DESC")
    List<Pedido> findByVendedorEmail(@Param("email") String email);

    @Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.usuario LEFT JOIN FETCH p.vendedor LEFT JOIN FETCH p.itens i LEFT JOIN FETCH i.produto WHERE p.idPedido = :id")
    Optional<Pedido> findDetalhadoById(@Param("id") Integer id);

    @Query("SELECT COUNT(p) > 0 FROM Pedido p JOIN p.itens i WHERE p.usuario.email = :email AND p.statusPedido = 'entregue' AND i.produto.idProduto = :idProduto")
    boolean existsPedidoEntreguePorCompradorEmailEProdutoId(@Param("email") String email, @Param("idProduto") Integer idProduto);

    boolean existsByChaveEntrega(String chaveEntrega);

    @Query("SELECT DISTINCT p FROM Pedido p JOIN p.itens i WHERE p.vendedor.id = :vendedorId AND i.produto.idProduto = :produtoId AND p.statusPedido = 'em analise' AND p.idPedido <> :pedidoAtualId")
    List<Pedido> findPendentesPorProduto(@Param("vendedorId") Integer vendedorId, @Param("produtoId") Integer produtoId, @Param("pedidoAtualId") Integer pedidoAtualId);
}