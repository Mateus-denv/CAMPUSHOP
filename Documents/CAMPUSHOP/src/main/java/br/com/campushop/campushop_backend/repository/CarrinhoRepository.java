package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

    Optional<Carrinho> findByCliente(Usuario cliente);

    boolean existsByCliente(Usuario cliente);

}
