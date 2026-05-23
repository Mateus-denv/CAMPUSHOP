package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // A chave nasce só depois da aprovação do vendedor e fica disponível para a entrega.
    @Column(name = "chave_entrega", unique = true, length = 8)
    private String chaveEntrega;

    // Marca quando o vendedor aprovou o pedido e gerou a chave de acesso.
    @Column(name = "data_aprovacao")
    private LocalDateTime dataAprovacao;

    // Registra quando a entrega foi concluída com sucesso.
    @Column(name = "data_entrega")
    private LocalDateTime dataEntrega;

    // Usa BigDecimal para preservar precisao de valores monetarios (DECIMAL no MySQL).
    @Column(name = "valor_pedido", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorPedido;

    // O banco valida os valores permitidos (aceito/rejeitado/em analise);
    // aqui mantemos String para aderir ao ENUM com valor contendo espaco.
    @Column(name = "status_pedido", nullable = false, length = 20)
    private String statusPedido;

    @Column(name = "motivo_rejeicao", length = 255)
    private String motivoRejeicao;

    // Armazena a data/hora em que o pedido foi criado.
    @Column(name = "data_pedido", nullable = false)
    private LocalDateTime dataPedido;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> itens = new ArrayList<>();

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

    public LocalDateTime getDataAprovacao() {
        return dataAprovacao;
    }

    public void setDataAprovacao(LocalDateTime dataAprovacao) {
        this.dataAprovacao = dataAprovacao;
    }

    public LocalDateTime getDataEntrega() {
        return dataEntrega;
    }

    public void setDataEntrega(LocalDateTime dataEntrega) {
        this.dataEntrega = dataEntrega;
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

    public String getMotivoRejeicao() {
        return motivoRejeicao;
    }

    public void setMotivoRejeicao(String motivoRejeicao) {
        this.motivoRejeicao = motivoRejeicao;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }

    public List<PedidoItem> getItens() {
        return itens;
    }

    public void setItens(List<PedidoItem> itens) {
        this.itens = itens;
    }

    public void adicionarItem(PedidoItem item) {
        this.itens.add(item);
        item.setPedido(this);
    }
}
