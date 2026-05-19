package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.CarrinhoRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class CarrinhoServiceValidationTest {

    @Mock
    private CarrinhoRepository carrinhoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CarrinhoService service;

    @Test
    void deveBloquearAdicaoAcimaDoEstoque() {
        Produto produto = new Produto();
        produto.setIdProduto(10);
        produto.setNomeProduto("Caderno");
        produto.setPreco(10.0);
        produto.setEstoque(2);

        assertThrows(RuntimeException.class, () -> service.adicionarAoCarrinho(1, produto, 3));
    }
}