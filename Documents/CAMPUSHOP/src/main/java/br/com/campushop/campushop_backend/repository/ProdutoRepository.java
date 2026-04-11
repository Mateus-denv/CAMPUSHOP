package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // IMPORTANTE: faltava esse cara!

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    List<Produto> findByStatus(String status);
}