package br.com.campushop.campushop_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.campushop.campushop_backend.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByUsuarioId(Integer usuarioId);
}
