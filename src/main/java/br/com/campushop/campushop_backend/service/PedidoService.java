package br.com.campushop.campushop_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.campushop.campushop_backend.dto.PedidoItemRequest;
import br.com.campushop.campushop_backend.exception.BusinessException;
import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;
import br.com.campushop.campushop_backend.model.PedidoStatus;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final CarrinhoService carrinhoService;

    public PedidoService(PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            ProdutoRepository produtoRepository,
            CarrinhoService carrinhoService) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
        this.carrinhoService = carrinhoService;
    }

    public List<Pedido> listarPedidosPorUsuario(int usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public Pedido criarPedido(int usuarioId, String endereco, String telefone) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado ao criar pedido"));

        List<Carrinho> carrinhoItens = carrinhoService.listarPorUsuario(usuarioId);
        if (carrinhoItens.isEmpty()) {
            throw new BusinessException("Carrinho vazio. Não é possível criar pedido sem itens.");
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setStatus(PedidoStatus.PENDENTE);
        pedido.setEndereco(endereco);
        pedido.setTelefone(telefone);
        pedido.setCriadoEm(LocalDateTime.now());
        pedido.setAtualizadoEm(LocalDateTime.now());

        List<PedidoItem> itens = new ArrayList<>();
        for (Carrinho carrinhoItem : carrinhoItens) {
            Produto produto = carrinhoItem.getProduto();
            Integer quantidade = carrinhoItem.getQuantidade();

            validarQuantidadeProduto(produto, quantidade);

            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.setProduto(produto);
            pedidoItem.setQuantidade(quantidade);
            pedidoItem.setPrecoUnitario(produto.getPreco());
            pedidoItem.setPedido(pedido);
            itens.add(pedidoItem);
        }

        pedido.setItens(itens);
        pedido.atualizarTotal();
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // Consumir carrinho apenas após salvar o pedido com sucesso.
        carrinhoService.limparCarrinho(usuarioId);

        return pedidoSalvo;
    }

    @Transactional
    public Pedido editarPedido(int usuarioId, int pedidoId, List<PedidoItemRequest> itensRequest) {
        Pedido pedido = buscarPedidoValido(usuarioId, pedidoId);

        if (pedido.getStatus() != PedidoStatus.PENDENTE) {
            throw new BusinessException("Somente pedidos com status PENDENTE podem ser editados.");
        }

        if (itensRequest == null || itensRequest.isEmpty()) {
            throw new BusinessException("Pedido deve conter ao menos um item.");
        }

        List<PedidoItem> itensAtualizados = itensRequest.stream()
                .map(itemRequest -> {
                    if (itemRequest.getQuantidade() == null || itemRequest.getQuantidade() <= 0) {
                        throw new BusinessException("Quantidade deve ser maior que zero.");
                    }
                    Integer produtoId = itemRequest.getProdutoId();
                    if (produtoId == null) {
                        throw new BusinessException("ID do produto é obrigatório.");
                    }
                    Produto produto = produtoRepository.findById(produtoId)
                            .orElseThrow(() -> new BusinessException(
                                    "Produto não encontrado: " + produtoId));
                    validarQuantidadeProduto(produto, itemRequest.getQuantidade());

                    PedidoItem item = new PedidoItem();
                    item.setProduto(produto);
                    item.setQuantidade(itemRequest.getQuantidade());
                    item.setPrecoUnitario(produto.getPreco());
                    item.setPedido(pedido);
                    return item;
                })
                .collect(Collectors.toList());

        pedido.setItens(itensAtualizados);
        pedido.atualizarTotal();
        pedido.setAtualizadoEm(LocalDateTime.now());
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cancelarPedido(int usuarioId, int pedidoId) {
        Pedido pedido = buscarPedidoValido(usuarioId, pedidoId);

        if (pedido.getStatus() == PedidoStatus.CANCELADO) {
            throw new BusinessException("Pedido já está cancelado.");
        }

        if (pedido.getStatus() == PedidoStatus.FINALIZADO) {
            throw new BusinessException("Pedido finalizado não pode ser cancelado.");
        }

        pedido.setStatus(PedidoStatus.CANCELADO);
        pedido.setAtualizadoEm(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    private Pedido buscarPedidoValido(int usuarioId, int pedidoId) {
        return pedidoRepository.findById(pedidoId)
                .filter(pedido -> pedido.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new BusinessException("Pedido não encontrado ou não pertence ao usuário."));
    }

    private void validarQuantidadeProduto(Produto produto, Integer quantidade) {
        if (produto == null) {
            throw new BusinessException("Produto inválido no pedido.");
        }

        if (quantidade == null || quantidade <= 0) {
            throw new BusinessException("Quantidade do produto deve ser maior que zero.");
        }

        if (produto.getEstoque() < quantidade) {
            throw new BusinessException(String.format(
                    "Estoque insuficiente para %s. Estoque disponível: %d, solicitado: %d",
                    produto.getNomeProduto(), produto.getEstoque(), quantidade));
        }
    }
}
