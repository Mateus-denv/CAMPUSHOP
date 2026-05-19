package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.PedidoItemRequest;
import br.com.campushop.campushop_backend.dto.PedidoRequest;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    private static final String STATUS_PENDENTE = "PENDENTE";
    private static final String STATUS_CANCELADO = "CANCELADO";

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final CarrinhoService carrinhoService;

    public PedidoService(PedidoRepository pedidoRepository, ProdutoRepository produtoRepository,
            CarrinhoService carrinhoService) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.carrinhoService = carrinhoService;
    }

    public List<Pedido> listarPorUsuario(Integer usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByDataPedidoDesc(usuarioId);
    }

    public Optional<Pedido> buscarPorIdDoUsuario(Integer pedidoId, Integer usuarioId) {
        return pedidoRepository.findByIdPedidoAndUsuarioId(pedidoId, usuarioId);
    }

    @Transactional
    public Pedido criarPedido(Usuario usuario, PedidoRequest request) {
        // Permite finalizar com um payload próprio ou usando os itens já presentes no
        // carrinho.
        List<ItemCompra> itensCompra = construirItensCompra(usuario.getId(), request);
        if (itensCompra.isEmpty()) {
            throw new RuntimeException("Não há itens válidos para gerar o pedido");
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setEndereco(request != null ? request.getEndereco() : null);
        pedido.setObservacoes(request != null ? request.getObservacoes() : null);
        pedido.setStatus(STATUS_PENDENTE);

        List<PedidoItem> itensPedido = new ArrayList<>();
        double total = 0D;

        for (ItemCompra itemCompra : itensCompra) {
            Produto produto = itemCompra.produto();
            Integer quantidade = itemCompra.quantidade();

            validarEstoqueDisponivel(produto, quantidade);
            Produto produtoAtualizado = reservarEstoque(produto, quantidade);

            PedidoItem itemPedido = new PedidoItem();
            itemPedido.setProduto(produtoAtualizado);
            itemPedido.setQuantidade(quantidade);
            itemPedido.setPrecoUnitario(produtoAtualizado.getPreco());
            itemPedido.setSubtotal(produtoAtualizado.getPreco() * quantidade);
            itensPedido.add(itemPedido);
            total += itemPedido.getSubtotal();
        }

        pedido.setItens(itensPedido);
        pedido.setTotal(total);

        Pedido salvo = pedidoRepository.save(pedido);

        // Quando o pedido vem do carrinho, ele deve ser esvaziado para evitar
        // duplicidade de compra.
        if (request == null || request.getItens() == null || request.getItens().isEmpty()) {
            carrinhoService.limparCarrinho(usuario.getId());
        }

        return salvo;
    }

    @Transactional
    public Pedido atualizarPedido(Integer pedidoId, Usuario usuario, PedidoRequest request) {
        Pedido pedido = pedidoRepository.findByIdPedidoAndUsuarioId(pedidoId, usuario.getId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado ou não pertence ao usuário"));

        validarPedidoEditavel(pedido);

        // A edição troca a composição inteira do pedido, então devolvemos o estoque
        // anterior primeiro.
        devolverEstoque(pedido.getItens());

        List<ItemCompra> itensCompra = construirItensCompraManual(request);
        if (itensCompra.isEmpty()) {
            throw new RuntimeException("O pedido precisa ter ao menos um item");
        }

        pedido.setEndereco(request.getEndereco());
        pedido.setObservacoes(request.getObservacoes());

        List<PedidoItem> novosItens = new ArrayList<>();
        double total = 0D;

        for (ItemCompra itemCompra : itensCompra) {
            Produto produto = itemCompra.produto();
            Integer quantidade = itemCompra.quantidade();

            validarEstoqueDisponivel(produto, quantidade);
            Produto produtoAtualizado = reservarEstoque(produto, quantidade);

            PedidoItem itemPedido = new PedidoItem();
            itemPedido.setProduto(produtoAtualizado);
            itemPedido.setQuantidade(quantidade);
            itemPedido.setPrecoUnitario(produtoAtualizado.getPreco());
            itemPedido.setSubtotal(produtoAtualizado.getPreco() * quantidade);
            novosItens.add(itemPedido);
            total += itemPedido.getSubtotal();
        }

        pedido.setItens(novosItens);
        pedido.setTotal(total);

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cancelarPedido(Integer pedidoId, Usuario usuario) {
        Pedido pedido = pedidoRepository.findByIdPedidoAndUsuarioId(pedidoId, usuario.getId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado ou não pertence ao usuário"));

        if (STATUS_CANCELADO.equalsIgnoreCase(pedido.getStatus())) {
            throw new RuntimeException("Pedido já está cancelado");
        }

        // Cancelar devolve o saldo ao estoque para não travar a quantidade do produto.
        devolverEstoque(pedido.getItens());
        pedido.setStatus(STATUS_CANCELADO);
        return pedidoRepository.save(pedido);
    }

    private List<ItemCompra> construirItensCompra(Integer usuarioId, PedidoRequest request) {
        if (request != null && request.getItens() != null && !request.getItens().isEmpty()) {
            return construirItensCompraManual(request);
        }

        return carrinhoService.listarPorUsuario(usuarioId).stream()
                .map(item -> new ItemCompra(item.getProduto(), item.getQuantidade()))
                .collect(Collectors.toList());
    }

    private List<ItemCompra> construirItensCompraManual(PedidoRequest request) {
        Map<Integer, ItemCompra> itensAgrupados = new LinkedHashMap<>();

        for (PedidoItemRequest itemRequest : request.getItens()) {
            Integer produtoId = itemRequest.getProdutoId();
            Integer quantidade = itemRequest.getQuantidade();

            if (produtoId == null || quantidade == null || quantidade <= 0) {
                throw new RuntimeException("Cada item do pedido precisa de produto e quantidade válidos");
            }

            int idProduto = produtoId;
            Produto produto = produtoRepository.findById(idProduto)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + idProduto));

            itensAgrupados.merge(idProduto, new ItemCompra(produto, quantidade),
                    (existente, novo) -> new ItemCompra(existente.produto(),
                            existente.quantidade() + novo.quantidade()));
        }

        return new ArrayList<>(itensAgrupados.values());
    }

    private void validarEstoqueDisponivel(Produto produto, Integer quantidade) {
        // A regra falha antes do save para impedir compras acima do saldo disponível.
        if (!carrinhoService.validarEstoque(produto, quantidade)) {
            throw new RuntimeException("Quantidade solicitada excede o estoque disponível para o produto "
                    + produto.getNomeProduto());
        }
    }

    private Produto reservarEstoque(Produto produto, Integer quantidade) {
        produto.setEstoque(produto.getEstoque() - quantidade);
        return produtoRepository.save(produto);
    }

    private void devolverEstoque(List<PedidoItem> itens) {
        for (PedidoItem item : itens) {
            Produto produto = item.getProduto();
            produto.setEstoque(produto.getEstoque() + item.getQuantidade());
            produtoRepository.save(produto);
        }
    }

    private void validarPedidoEditavel(Pedido pedido) {
        // Apenas pedidos pendentes podem ser editados para não alterar histórico de
        // envio/entrega.
        if (!STATUS_PENDENTE.equalsIgnoreCase(pedido.getStatus())) {
            throw new RuntimeException("Apenas pedidos pendentes podem ser editados");
        }
    }

    private record ItemCompra(Produto produto, Integer quantidade) {
    }
}