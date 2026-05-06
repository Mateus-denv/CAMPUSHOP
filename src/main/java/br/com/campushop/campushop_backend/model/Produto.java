package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*; // Importando as anotações JPA para mapear a classe como entidade e definir as colunas
import com.fasterxml.jackson.annotation.JsonProperty;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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
    @JoinColumn(name = "id_categoria")
    private Categoria categoria; // O produto pode ser sim vinculado com o id mas na hora do usurio vizualizar o
                                 // produto ele vai ver o nome da categoria e nao o id, entao aqui a gente tem
                                 // que usar a classe Categoria mesmo.

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario; // Usuário que criou o produto

    // --- GETTERS E SETTERS ---
    // Eles permitem que o Spring leia e grave os dados nos campos privados

    public Integer getIdProduto() {
        return idProduto;
    }

    public void setIdProduto(Integer idProduto) {
        this.idProduto = idProduto;
    }

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

    public Integer getEstoque() {
        return estoque;
    }

    public void setEstoque(Integer estoque) {
        this.estoque = estoque;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDimensoes() {
        return dimensoes;
    }

    public void setDimensoes(String dimensoes) {
        this.dimensoes = dimensoes;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    // Expõe o id do vendedor no payload sem duplicar dado na tabela de produto.
    @JsonProperty("vendedor_id")
    public Integer getVendedorId() {
        return usuario != null ? usuario.getId() : null;
    }

    // Expõe nome do vendedor para facilitar exibição no frontend com baixo acoplamento.
    @JsonProperty("nomeVendedor")
    public String getNomeVendedor() {
        return usuario != null ? usuario.getNomeCompleto() : null;
    }

    // Expõe campus do vendedor no formato "Instituição - Cidade".
    @JsonProperty("campusVendedor")
    public String getCampusVendedor() {
        if (usuario == null) {
            return null;
        }
        String instituicao = usuario.getInstituicaoEnsino();
        String cidade = usuario.getCidade();
        if (instituicao != null && cidade != null) {
            return instituicao + " - " + cidade;
        }
        if (instituicao != null) {
            return instituicao;
        }
        return cidade;
    }

    // Avaliação simulada no backend para UX, baseada no id do vendedor.
    @JsonProperty("avaliacaoVendedor")
    public Double getAvaliacaoVendedor() {
        if (usuario == null || usuario.getId() == null) {
            return null;
        }
        int base = usuario.getId() % 5;
        return 4.5 + (base * 0.1);
    }

    // Miniatura do produto gerada como SVG inline.
    @JsonProperty("imagemProduto")
    public String getImagemProduto() {
        String nome = nomeProduto != null ? nomeProduto : "Produto";
        String initials = nome.trim().isEmpty() ? "P" : nome.substring(0, 1).toUpperCase();
        String svg = "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
                "<rect width='120' height='120' rx='24' fill='#E2E8F0'/>" +
                "<text x='50%' y='52%' text-anchor='middle' font-size='48' fill='#334155' font-family='Arial' dy='.1em'>" +
                initials + "</text></svg>";
        String encoded = URLEncoder.encode(svg, StandardCharsets.UTF_8);
        return "data:image/svg+xml;charset=UTF-8," + encoded;
    }
}