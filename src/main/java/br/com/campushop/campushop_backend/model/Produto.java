package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*; // Importando as anotações JPA para mapear a classe como entidade e definir as colunas

@Entity
@Table(name = "produto")

public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_produto") // Força o nome exatamente como o MySQL quer
    private Integer idProduto;

    @Column(name = "nome_produto", nullable = false, length = 200)
    private String nomeProduto; // Dica: use CamelCase no Java para seguir o padrão da linguagem

    @Column(length = 100)
    private String nome;

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

    // @ManyToOne
    // @JoinColumn(name = "idVendedor")
    // private Usuario vendedor;

    @ManyToOne
    @JoinColumn(name = "idCategoria")
    private Categoria categoria;
}
