package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria") // Especifica o nome da tabela no banco de dados, que é "categoria"
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer idCategoria;
    
@Column(name = "nome_categoria", nullable = false, length = 100)
    private String nome_categoria;

    @Column(columnDefinition = "TEXT")
    private String descricao;

   public Integer getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Integer idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNome_categoria() {
        return nome_categoria;
    }

    public void setNome_categoria(String nome_categoria) {
        this.nome_categoria = nome_categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}