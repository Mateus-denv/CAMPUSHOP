package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    Optional<Produto> findByIdAndVendedor(Long id, Usuario vendedor);

    List<Produto> findByVendedor(Usuario vendedor);

    List<Produto> findByNomeContainingIgnoreCase(String nome);

}
