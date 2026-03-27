package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemPedido> itens = new ArrayList<>();

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPedido;

    @Column(nullable = false)
    private String statusPedido; // PENDENTE, CONFIRMADO, ENVIADO, ENTREGUE, CANCELADO

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime dataPedido;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private java.time.LocalDateTime dataAtualizacao;

    @Column
    private String observacoes;

    // Constructors
    public Pedido() {
        this.statusPedido = "PENDENTE";
        this.dataPedido = java.time.LocalDateTime.now();
        this.dataAtualizacao = java.time.LocalDateTime.now();
    }

    public Pedido(Usuario cliente, BigDecimal totalPedido) {
        this.cliente = cliente;
        this.totalPedido = totalPedido;
        this.statusPedido = "PENDENTE";
        this.itens = new ArrayList<>();
        this.dataPedido = java.time.LocalDateTime.now();
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

    public List<ItemPedido> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }

    public BigDecimal getTotalPedido() {
        return totalPedido;
    }

    public void setTotalPedido(BigDecimal totalPedido) {
        this.totalPedido = totalPedido;
    }

    public String getStatusPedido() {
        return statusPedido;
    }

    public void setStatusPedido(String statusPedido) {
        this.statusPedido = statusPedido;
    }

    public java.time.LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(java.time.LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }

    public java.time.LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(java.time.LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    // Business methods
    public void adicionarItem(ItemPedido item) {
        if (this.itens == null) {
            this.itens = new ArrayList<>();
        }
        this.itens.add(item);
        item.setPedido(this);
    }

    @Override
    public String toString() {
        return "Pedido{" +
                "id=" + id +
                ", cliente=" + (cliente != null ? cliente.getId() : null) +
                ", totalPedido=" + totalPedido +
                ", statusPedido='" + statusPedido + '\'' +
                ", dataPedido=" + dataPedido +
                '}';
    }
}
