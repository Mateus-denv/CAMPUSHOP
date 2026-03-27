package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.ItemCarrinho;
import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCarrinhoRepository extends JpaRepository<ItemCarrinho, Long> {

    Optional<ItemCarrinho> findByCarrinhoAndProduto(Carrinho carrinho, Produto produto);

    List<ItemCarrinho> findByCarrinho(Carrinho carrinho);

    void deleteByCarrinho(Carrinho carrinho);

}
