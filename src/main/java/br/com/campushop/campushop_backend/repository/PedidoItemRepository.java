package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, Integer> {
    List<PedidoItem> findByPedido_IdPedido(Integer pedidoId);
}