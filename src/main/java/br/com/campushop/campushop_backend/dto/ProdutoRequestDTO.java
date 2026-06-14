package br.com.campushop.campushop_backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * DTO para requisição de criar/atualizar produto
 * Valida dados antes de chegar no Service
 */
public class ProdutoRequestDTO {

    @NotBlank(message = "Nome do produto é obrigatório")
    @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres")
    private String nomeProduto;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(min = 10, max = 2000, message = "Descrição deve ter entre 10 e 2000 caracteres")
    private String descricao;

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    @DecimalMax(value = "99999.99", message = "Preço máximo é R$ 99.999,99")
    private BigDecimal preco;

    @NotNull(message = "Categoria é obrigatória")
    @Positive(message = "ID da categoria deve ser um número positivo")
    private Integer idCategoria;

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 0, message = "Quantidade não pode ser negativa")
    @Max(value = 999, message = "Quantidade máxima é 999")
    private Integer estoque;

    // Getters e Setters
    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public Integer getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Integer idCategoria) {
        this.idCategoria = idCategoria;
    }

    public Integer getEstoque() {
        return estoque;
    }

    public void setEstoque(Integer estoque) {
        this.estoque = estoque;
    }
}
