package br.com.campushop.campushop_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PedidoResponse {
    private Integer id;
    private String status;
    private Double total;
    private LocalDateTime criadoEm;
    private String endereco;
    private String telefone;
    private List<PedidoItemResponse> itens;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public List<PedidoItemResponse> getItens() {
        return itens;
    }

    public void setItens(List<PedidoItemResponse> itens) {
        this.itens = itens;
    }
}
