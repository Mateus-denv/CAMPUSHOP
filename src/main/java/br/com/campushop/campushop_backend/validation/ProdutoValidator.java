package br.com.campushop.campushop_backend.validation;

import br.com.campushop.campushop_backend.model.Produto;
import org.springframework.stereotype.Component;

@Component
public class ProdutoValidator {

    public void validarProduto(Produto produto) {
        validarNome(produto.getNomeProduto());
        validarDescricao(produto.getDescricao());
        validarEstoque(produto.getEstoque());
        validarPreco(produto.getPreco());
        validarUsuario(produto.getUsuario());
        // Dimensoes e peso são opcionais, dependendo do tipo
        // Assumindo que se for alimento, dimensoes não são necessárias
        // Mas por enquanto, vamos validar apenas se fornecidos
        if (produto.getDimensoes() != null && !produto.getDimensoes().trim().isEmpty()) {
            validarDimensoes(produto.getDimensoes());
        }
        if (produto.getPeso() != null) {
            validarPeso(produto.getPeso());
        }
    }

    private void validarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new RuntimeException("Nome do produto é obrigatório");
        }
        if (nome.trim().length() < 3) {
            throw new RuntimeException("Nome do produto deve ter pelo menos 3 caracteres");
        }
    }

    private void validarDescricao(String descricao) {
        if (descricao == null || descricao.trim().isEmpty()) {
            throw new RuntimeException("Descrição do produto é obrigatória");
        }
    }

    private void validarEstoque(Integer estoque) {
        if (estoque == null || estoque < 0) {
            throw new RuntimeException("Estoque deve ser um número positivo");
        }
    }

    private void validarPreco(Double preco) {
        if (preco == null || preco <= 0) {
            throw new RuntimeException("Preço deve ser um valor positivo");
        }
    }

    private void validarDimensoes(String dimensoes) {
        // Validação básica, pode ser expandida
        if (dimensoes.trim().length() < 3) {
            throw new RuntimeException("Dimensões devem ser descritas adequadamente");
        }
    }

    private void validarPeso(Double peso) {
        if (peso <= 0) {
            throw new RuntimeException("Peso deve ser um valor positivo");
        }
    }

    private void validarUsuario(Object usuario) {
        if (usuario == null) {
            throw new RuntimeException("Usuário é obrigatório para o produto");
        }
    }
}