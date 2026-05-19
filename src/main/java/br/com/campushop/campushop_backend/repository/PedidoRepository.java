package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    List<Pedido> findByUsuarioIdOrderByDataPedidoDesc(Integer usuarioId);

    Optional<Pedido> findByIdPedidoAndUsuarioId(Integer idPedido, Integer usuarioId);
}