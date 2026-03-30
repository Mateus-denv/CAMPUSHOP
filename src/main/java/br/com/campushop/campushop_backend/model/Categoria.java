package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria") // Certifique-se que o nome na tabela é este
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer idCategoria;
    
    private String nome_categoria;
    private String descricao;

    // Getters e Setters
}