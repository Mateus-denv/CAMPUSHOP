package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.ItemPedido;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.repository.CarrinhoRepository;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    /**
     * Cria um pedido a partir dos itens do carrinho do usuário e limpa o carrinho ao final.
     * Executado em transação para garantir atomicidade: ou tudo é salvo ou nada é.
     */
    @Transactional
    public Pedido criarPedidoDoCarrinho(Integer usuarioId) {
        List<Carrinho> itensCarrinho = carrinhoRepository.findByUsuarioId(usuarioId);

        if (itensCarrinho.isEmpty()) {
            throw new RuntimeException("Carrinho está vazio");
        }

        // Monta o pedido base com o usuário do primeiro item (todos pertencem ao mesmo usuário)
        Pedido pedido = new Pedido();
        pedido.setUsuario(itensCarrinho.get(0).getUsuario());
        pedido.setStatus("aguardando");
        pedido.setCriadoEm(LocalDateTime.now());

        // Converte cada item do carrinho em ItemPedido com preço congelado
        List<ItemPedido> itensPedido = new ArrayList<>();
        double total = 0.0;

        for (Carrinho item : itensCarrinho) {
            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProduto(item.getProduto());
            itemPedido.setQuantidade(item.getQuantidade());
            // Congela o preço no momento da compra para não ser afetado por alterações futuras
            itemPedido.setPrecoUnitario(item.getProduto().getPreco());
            itensPedido.add(itemPedido);
            total += item.getProduto().getPreco() * item.getQuantidade();
        }

        pedido.setItens(itensPedido);
        pedido.setTotal(total);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // Limpa o carrinho após a criação do pedido
        carrinhoRepository.deleteByUsuarioId(usuarioId);

        return pedidoSalvo;
    }

    /**
     * Lista todos os pedidos do usuário, do mais recente ao mais antigo.
     */
    public List<Pedido> listarPorUsuario(Integer usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
    }
}
