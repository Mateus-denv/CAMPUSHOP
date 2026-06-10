package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*; // Importando as anotações JPA para mapear a classe como entidade e definir as colunas
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

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

    // Descrição curta específica para variantes — visível na listagem da variante.
    @Column(name = "descricao_variacao", length = 100)
    private String descricaoVariacao;

    @Column(nullable = false)
    private Integer estoque;

    @Column(nullable = false)
    private Double preco;

    @Column(length = 20)
    private String status;

    @Column(name = "visivel_para_comprador", nullable = false)
    private Boolean visivelParaComprador = Boolean.TRUE;

    // Indica se o anúncio principal foi cadastrado com variações selecionáveis.
    @Column(name = "possui_variantes", nullable = false)
    private Boolean possuiVariantes = Boolean.FALSE;

    // Marca quando este registro é uma variante filha de outro produto.
    @Column(name = "eh_variacao", nullable = false)
    private Boolean ehVariacao = Boolean.FALSE;

    @Column(name = "tipo_produto", length = 20)
    private String tipoProduto = "PRODUTO";

    private String dimensoes;
    
    private Double peso;
    
    // Indica se o produto exige que dimensões separadas sejam informadas (comprimento x largura).
    // Adicionado para compatibilidade com a API frontend que envia `usaDimensoes`.
    @Column(name = "usa_dimensoes", nullable = false)
    private Boolean usaDimensoes = Boolean.FALSE;

    // Comprimento e largura separados — mapeados para colunas do banco caso existam.
    @Column(name = "dimensao_comprimento")
    private Double dimensaoComprimento;

    @Column(name = "dimensao_largura")
    private Double dimensaoLargura;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private Categoria categoria; // O produto pode ser sim vinculado com o id mas na hora do usurio vizualizar o
                                 // produto ele vai ver o nome da categoria e nao o id, entao aqui a gente tem
                                 // que usar a classe Categoria mesmo.

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario; // Usuário que criou o produto

    // Guarda o produto pai quando este registro representa uma variante.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto_pai")
    private Produto produtoPai;

    // Lista de variantes enviada no cadastro do anúncio principal.
    @Transient
    private List<Produto> variantes;

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

    public String getDescricaoVariacao() {
        return descricaoVariacao;
    }

    public void setDescricaoVariacao(String descricaoVariacao) {
        this.descricaoVariacao = descricaoVariacao;
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

    public Boolean getVisivelParaComprador() {
        return visivelParaComprador;
    }

    public void setVisivelParaComprador(Boolean visivelParaComprador) {
        this.visivelParaComprador = visivelParaComprador;
    }

    public Boolean getPossuiVariantes() {
        return possuiVariantes;
    }

    public void setPossuiVariantes(Boolean possuiVariantes) {
        this.possuiVariantes = possuiVariantes;
    }

    public Boolean getEhVariacao() {
        return ehVariacao;
    }

    public void setEhVariacao(Boolean ehVariacao) {
        this.ehVariacao = ehVariacao;
    }

    public String getTipoProduto() {
        return tipoProduto;
    }

    public void setTipoProduto(String tipoProduto) {
        this.tipoProduto = tipoProduto;
    }

    public String getDimensoes() {
        return dimensoes;
    }

    public void setDimensoes(String dimensoes) {
        this.dimensoes = dimensoes;
    }

    public Boolean getUsaDimensoes() {
        return usaDimensoes;
    }

    public void setUsaDimensoes(Boolean usaDimensoes) {
        this.usaDimensoes = usaDimensoes;
    }

    public Double getDimensaoComprimento() {
        return dimensaoComprimento;
    }

    public void setDimensaoComprimento(Double dimensaoComprimento) {
        this.dimensaoComprimento = dimensaoComprimento;
    }

    public Double getDimensaoLargura() {
        return dimensaoLargura;
    }

    public void setDimensaoLargura(Double dimensaoLargura) {
        this.dimensaoLargura = dimensaoLargura;
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

    @JsonIgnore
    public Produto getProdutoPai() {
        return produtoPai;
    }

    public void setProdutoPai(Produto produtoPai) {
        this.produtoPai = produtoPai;
    }

    public List<Produto> getVariantes() {
        return variantes;
    }

    public void setVariantes(List<Produto> variantes) {
        this.variantes = variantes;
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

    // Expõe o id do produto pai para as variantes sem serializar a entidade inteira.
    @JsonProperty("produtoPaiId")
    public Integer getProdutoPaiId() {
        return produtoPai != null ? produtoPai.getIdProduto() : null;
    }

    // Expõe o nome do produto pai para a UI mostrar contexto da variante.
    @JsonProperty("produtoPaiNome")
    public String getProdutoPaiNome() {
        return produtoPai != null ? produtoPai.getNomeProduto() : null;
    }
}