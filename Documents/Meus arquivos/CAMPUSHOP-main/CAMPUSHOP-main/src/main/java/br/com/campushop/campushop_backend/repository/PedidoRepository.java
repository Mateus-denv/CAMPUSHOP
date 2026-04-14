package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByClienteIdOrderByDataDesc(Long clienteId);
}
