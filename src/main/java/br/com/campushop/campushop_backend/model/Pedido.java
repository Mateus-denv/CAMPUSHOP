package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Integer idPedido;

    // Relaciona o pedido ao cliente que confirmou a compra.
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // Relaciona o pedido ao vendedor dono do produto comprado.
    @ManyToOne
    @JoinColumn(name = "id_vendedor", nullable = false)
    private Usuario vendedor;

    // Mantem a chave de entrega persistida no formato definido no banco.
    @Column(name = "chave_entrega", nullable = false, unique = true, length = 8)
    private String chaveEntrega;

    // Usa BigDecimal para preservar precisao de valores monetarios (DECIMAL no MySQL).
    @Column(name = "valor_pedido", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorPedido;

    // O banco valida os valores permitidos (aceito/rejeitado/em analise);
    // aqui mantemos String para aderir ao ENUM com valor contendo espaco.
    @Column(name = "status_pedido", nullable = false, length = 20)
    private String statusPedido;

    // Armazena a data/hora em que o pedido foi criado.
    @Column(name = "data_pedido", nullable = false)
    private LocalDateTime dataPedido;

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Usuario getVendedor() {
        return vendedor;
    }

    public void setVendedor(Usuario vendedor) {
        this.vendedor = vendedor;
    }

    public String getChaveEntrega() {
        return chaveEntrega;
    }

    public void setChaveEntrega(String chaveEntrega) {
        this.chaveEntrega = chaveEntrega;
    }

    public BigDecimal getValorPedido() {
        return valorPedido;
    }

    public void setValorPedido(BigDecimal valorPedido) {
        this.valorPedido = valorPedido;
    }

    public String getStatusPedido() {
        return statusPedido;
    }

    public void setStatusPedido(String statusPedido) {
        this.statusPedido = statusPedido;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }
}
