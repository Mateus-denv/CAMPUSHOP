package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Integer> {
    List<Carrinho> findByUsuarioId(Integer usuarioId);

    void deleteByUsuarioId(Integer usuarioId);
}
