package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*; // Importando as anotações JPA para mapear a classe como entidade e definir as colunas

@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_produto")
    private Integer idProduto;

    @Column(name = "nome_produto", nullable = false, length = 200)
    private String nomeProduto;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private Integer estoque;

    @Column(nullable = false)
    private Double preco;

    @Column(length = 20)
    private String status;

    private String dimensoes;
    private Double peso;

    @ManyToOne
    @JoinColumn(name = "idCategoria")
    private Categoria categoria; // O produto pode ser sim vinculado com o id mas na hora do usurio vizualizar o produto ele vai ver o nome da categoria e nao o id, entao aqui a gente tem que usar a classe Categoria mesmo.

    // --- GETTERS E SETTERS ---
    // Eles permitem que o Spring leia e grave os dados nos campos privados

    public Integer getIdProduto() { return idProduto; }
    public void setIdProduto(Integer idProduto) { this.idProduto = idProduto; }

    public String getNomeProduto() { return nomeProduto; }
    public void setNomeProduto(String nomeProduto) { this.nomeProduto = nomeProduto; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Integer getEstoque() { return estoque; }
    public void setEstoque(Integer estoque) { this.estoque = estoque; }

    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDimensoes() { return dimensoes; }
    public void setDimensoes(String dimensoes) { this.dimensoes = dimensoes; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
}