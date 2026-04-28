package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // Busca todos os pedidos do usuário, ordenados do mais recente para o mais antigo
    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId ORDER BY p.criadoEm DESC")
    List<Pedido> findByUsuarioIdOrderByCriadoEmDesc(@Param("usuarioId") Integer usuarioId);
}
