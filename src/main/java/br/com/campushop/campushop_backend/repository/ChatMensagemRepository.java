package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.ChatMensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMensagemRepository extends JpaRepository<ChatMensagem, Integer> {

    List<ChatMensagem> findByPedido_IdPedidoOrderByCriadoEmAsc(Integer pedidoId);
}
