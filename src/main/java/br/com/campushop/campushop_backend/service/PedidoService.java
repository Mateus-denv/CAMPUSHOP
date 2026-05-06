package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.PedidoCheckoutItem;
import br.com.campushop.campushop_backend.model.*;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.PedidoItemRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private PedidoItemRepository pedidoItemRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CarrinhoService carrinhoService;

    @Autowired
    private UsuarioService usuarioService;

    // Criar pedido a partir do carrinho
    @Transactional
    public Pedido criarPedido(Integer usuarioId, Integer idTipoPagamento) {
        List<Carrinho> itensCarrinho = carrinhoService.listarPorUsuario(usuarioId);

        if (itensCarrinho.isEmpty()) {
            throw new RuntimeException("Carrinho está vazio");
        }

        // Verificar estoque novamente
        for (Carrinho item : itensCarrinho) {
            Produto produto = item.getProduto();
            if (item.getQuantidade() > produto.getEstoque()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNomeProduto());
            }
        }

        // Criar pedido
        Pedido pedido = new Pedido();
        pedido.setDataPedido(LocalDate.now());
        pedido.setStatusPedido("PENDENTE");
        pedido.setCliente(itensCarrinho.get(0).getUsuario()); // Assumindo que todos os itens têm o mesmo usuário
        pedido.setIdTipoPagamento(idTipoPagamento);

        double total = 0.0;
        for (Carrinho item : itensCarrinho) {
            total += item.getProduto().getPreco() * item.getQuantidade();
        }
        pedido.setValorTotal(total);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // Criar itens do pedido e reduzir estoque
        for (Carrinho item : itensCarrinho) {
            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.setPedido(pedidoSalvo);
            pedidoItem.setProduto(item.getProduto());
            pedidoItem.setQuantidade(item.getQuantidade());
            pedidoItem.setPrecoUnitario(item.getProduto().getPreco());
            pedidoItem.setSubtotal(item.getProduto().getPreco() * item.getQuantidade());

            pedidoItemRepository.save(pedidoItem);

            // Reduzir estoque
            Produto produto = item.getProduto();
            produto.setEstoque(produto.getEstoque() - item.getQuantidade());
            produtoRepository.save(produto);
        }

        // Limpar carrinho
        carrinhoService.limparCarrinho(usuarioId);

        return pedidoSalvo;
    }

    // Criar pedido a partir de itens enviados no checkout
    @Transactional
    public Pedido criarPedidoComItens(Integer usuarioId, Integer idTipoPagamento, List<PedidoCheckoutItem> itens) {
        if (itens == null || itens.isEmpty()) {
            throw new RuntimeException("Carrinho está vazio");
        }

        Usuario cliente = usuarioService.buscarPorId(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        double total = 0.0;

        for (PedidoCheckoutItem item : itens) {
            Produto produto = produtoRepository.findById(item.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
            if (item.getQuantidade() <= 0) {
                throw new RuntimeException("Quantidade inválida");
            }
            if (item.getQuantidade() > produto.getEstoque()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNomeProduto());
            }
            total += produto.getPreco() * item.getQuantidade();
        }

        Pedido pedido = new Pedido();
        pedido.setDataPedido(LocalDate.now());
        pedido.setStatusPedido("PENDENTE");
        pedido.setCliente(cliente);
        pedido.setIdTipoPagamento(idTipoPagamento);
        pedido.setValorTotal(total);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        for (PedidoCheckoutItem item : itens) {
            Produto produto = produtoRepository.findById(item.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.setPedido(pedidoSalvo);
            pedidoItem.setProduto(produto);
            pedidoItem.setQuantidade(item.getQuantidade());
            pedidoItem.setPrecoUnitario(produto.getPreco());
            pedidoItem.setSubtotal(produto.getPreco() * item.getQuantidade());

            pedidoItemRepository.save(pedidoItem);

            produto.setEstoque(produto.getEstoque() - item.getQuantidade());
            produtoRepository.save(produto);
        }

        return pedidoSalvo;
    }

    // Listar pedidos do usuário
    public List<Pedido> listarPedidosUsuario(Integer usuarioId) {
        return pedidoRepository.findByClienteId(usuarioId);
    }

    // Buscar pedido por ID
    public Optional<Pedido> buscarPorId(Integer pedidoId) {
        return pedidoRepository.findById(pedidoId);
    }

    // Cancelar pedido
    @Transactional
    public Pedido cancelarPedido(Integer pedidoId, Integer usuarioId) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);

        if (pedidoOpt.isEmpty()) {
            throw new RuntimeException("Pedido não encontrado");
        }

        Pedido pedido = pedidoOpt.get();

        if (!pedido.getCliente().getId().equals(usuarioId)) {
            throw new RuntimeException("Pedido não pertence ao usuário");
        }

        if (!"PENDENTE".equals(pedido.getStatusPedido())) {
            throw new RuntimeException("Pedido não pode ser cancelado");
        }

        // Restaurar estoque
        List<PedidoItem> itens = pedidoItemRepository.findByPedido_IdPedido(pedidoId);
        for (PedidoItem item : itens) {
            Produto produto = item.getProduto();
            produto.setEstoque(produto.getEstoque() + item.getQuantidade());
            produtoRepository.save(produto);
        }

        pedido.setStatusPedido("CANCELADO");
        return pedidoRepository.save(pedido);
    }

    // Editar pedido (apenas se pendente)
    @Transactional
    public Pedido editarPedido(Integer pedidoId, Integer usuarioId, List<PedidoItem> novosItens) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);

        if (pedidoOpt.isEmpty()) {
            throw new RuntimeException("Pedido não encontrado");
        }

        Pedido pedido = pedidoOpt.get();

        if (!pedido.getCliente().getId().equals(usuarioId)) {
            throw new RuntimeException("Pedido não pertence ao usuário");
        }

        if (!"PENDENTE".equals(pedido.getStatusPedido())) {
            throw new RuntimeException("Pedido não pode ser editado");
        }

        // Remover itens antigos e restaurar estoque
        List<PedidoItem> itensAntigos = pedidoItemRepository.findByPedido_IdPedido(pedidoId);
        for (PedidoItem item : itensAntigos) {
            Produto produto = item.getProduto();
            produto.setEstoque(produto.getEstoque() + item.getQuantidade());
            produtoRepository.save(produto);
            pedidoItemRepository.delete(item);
        }

        // Verificar estoque para novos itens
        double novoTotal = 0.0;
        for (PedidoItem item : novosItens) {
            Produto produto = item.getProduto();
            if (item.getQuantidade() > produto.getEstoque()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNomeProduto());
            }
            novoTotal += item.getPrecoUnitario() * item.getQuantidade();
        }

        // Salvar novos itens e reduzir estoque
        for (PedidoItem item : novosItens) {
            item.setPedido(pedido);
            pedidoItemRepository.save(item);

            Produto produto = item.getProduto();
            produto.setEstoque(produto.getEstoque() - item.getQuantidade());
            produtoRepository.save(produto);
        }

        pedido.setValorTotal(novoTotal);
        return pedidoRepository.save(pedido);
    }
}