package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.exception.PlanLimitExceededException;
import br.com.campushop.campushop_backend.model.Categoria;
import br.com.campushop.campushop_backend.model.PlanType;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Subscription;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.CategoriaRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.repository.SubscriptionRepository;
import br.com.campushop.campushop_backend.validation.ProdutoValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProdutoValidator produtoValidator;

    @Mock
    private ImagemService imagemService;

    @Mock
    private SubscriptionService subscriptionService;

    @Test
    void salvarShouldBlockWhenEssentialLimitIsReached() {
        ProdutoService produtoService = new ProdutoService(produtoRepository, categoriaRepository, produtoValidator, imagemService, subscriptionService);

        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setEmail("user@campus.com");
        Subscription subscription = new Subscription();
        subscription.setPlan(PlanType.ESSENTIAL);
        subscription.setActive(Boolean.TRUE);
        usuario.setSubscription(subscription);

        Produto produto = new Produto();
        produto.setUsuario(usuario);
        produto.setNomeProduto("Notebook");
        produto.setDescricao("Produto teste");
        produto.setEstoque(1);
        produto.setPreco(100.0);
        Categoria categoria = new Categoria();
        categoria.setIdCategoria(1);
        produto.setCategoria(categoria);

        when(subscriptionService.getCurrentPlan(any())).thenReturn(subscription);
        when(produtoRepository.countByUsuario_EmailAndProdutoPaiIsNull("user@campus.com")).thenReturn(10L);

        assertThrows(PlanLimitExceededException.class, () -> produtoService.salvar(produto));
    }
}
