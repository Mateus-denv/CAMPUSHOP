package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByVendedorId(Long vendedorId);
}
