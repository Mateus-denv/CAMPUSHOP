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

    // --- GETTERS E SETTERS ---
    public Integer getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Integer idCategoria) { this.idCategoria = idCategoria; } // O ID é gerado automaticamente, então geralmente não precisamos de um setter para ele

    public String getNomeCategoria() { return nome_categoria; }
    public void setNomeCategoria(String nomeCategoria) { this.nome_categoria = nomeCategoria; } // O nome da categoria é obrigatório, então não pode ser nulo

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; } // A descrição é opcional, então pode ser nula
}