package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    List<Pedido> findByCliente(Usuario cliente);
    
    List<Pedido> findByStatusPedido(String status);
    
    List<Pedido> findByClienteOrderByDataPedidoDesc(Usuario cliente);
    
}
