package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.ImagemAnexo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImagemAnexoRepository extends JpaRepository<ImagemAnexo, Integer> {

    Optional<ImagemAnexo> findFirstByUsuarioIdAndTipoOrderByDataUploadDesc(Integer usuarioId, String tipo);

    void deleteByUsuarioIdAndTipo(Integer usuarioId, String tipo);

    List<ImagemAnexo> findByProduto_IdProdutoAndTipoOrderByDataUploadDesc(Integer produtoId, String tipo);

    Optional<ImagemAnexo> findFirstByProduto_IdProdutoAndTipoOrderByDataUploadDesc(Integer produtoId, String tipo);

    Optional<ImagemAnexo> findByIdAndProduto_IdProduto(Integer id, Integer produtoId);

    // Remove todas as imagens dos produtos cujo id esteja na lista fornecida.
    void deleteByProduto_IdProdutoIn(java.util.List<Integer> produtoIds);
}