package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carrinhos")
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "cliente_id", nullable = false, unique = true)
    private Usuario cliente;

    @OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemCarrinho> itens = new ArrayList<>();

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime dataCriacao;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private java.time.LocalDateTime dataAtualizacao;

    // Constructors
    public Carrinho() {
        this.dataCriacao = java.time.LocalDateTime.now();
        this.dataAtualizacao = java.time.LocalDateTime.now();
    }

    public Carrinho(Usuario cliente) {
        this.cliente = cliente;
        this.itens = new ArrayList<>();
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

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public List<ItemCarrinho> getItens() {
        return itens;
    }

    public void setItens(List<ItemCarrinho> itens) {
        this.itens = itens;
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
    public boolean temItens() {
        return itens != null && !itens.isEmpty();
    }

    public void adicionarItem(ItemCarrinho item) {
        if (this.itens == null) {
            this.itens = new ArrayList<>();
        }
        this.itens.add(item);
        item.setCarrinho(this);
    }

    public void removerItem(ItemCarrinho item) {
        if (this.itens != null) {
            this.itens.remove(item);
        }
    }

    public void limpar() {
        if (this.itens != null) {
            this.itens.clear();
        }
    }

    @Override
    public String toString() {
        return "Carrinho{" +
                "id=" + id +
                ", cliente=" + (cliente != null ? cliente.getId() : null) +
                ", totalItens=" + (itens != null ? itens.size() : 0) +
                '}';
    }
}
