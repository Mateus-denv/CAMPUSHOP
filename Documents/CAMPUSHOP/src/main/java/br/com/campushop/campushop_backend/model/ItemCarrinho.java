package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "itens_carrinho", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "carrinho_id", "produto_id" })
})
public class ItemCarrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "carrinho_id", nullable = false)
    private Carrinho carrinho;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime dataCriacao;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private java.time.LocalDateTime dataAtualizacao;

    // Constructors
    public ItemCarrinho() {
        this.dataCriacao = java.time.LocalDateTime.now();
        this.dataAtualizacao = java.time.LocalDateTime.now();
    }

    public ItemCarrinho(Carrinho carrinho, Produto produto, Integer quantidade) {
        this.carrinho = carrinho;
        this.produto = produto;
        this.quantidade = quantidade;
        this.precoUnitario = produto.getPreco();
        this.dataCriacao = java.time.LocalDateTime.now();
        this.dataAtualizacao = java.time.LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Carrinho getCarrinho() {
        return carrinho;
    }

    public void setCarrinho(Carrinho carrinho) {
        this.carrinho = carrinho;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public java.time.LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(java.time.LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public java.time.LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(java.time.LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    // Business methods
    public BigDecimal getSubtotal() {
        return this.precoUnitario.multiply(new BigDecimal(this.quantidade));
    }

    @Override
    public String toString() {
        return "ItemCarrinho{" +
                "id=" + id +
                ", produto=" + (produto != null ? produto.getId() : null) +
                ", quantidade=" + quantidade +
                ", precoUnitario=" + precoUnitario +
                ", subtotal=" + getSubtotal() +
                '}';
    }
}
