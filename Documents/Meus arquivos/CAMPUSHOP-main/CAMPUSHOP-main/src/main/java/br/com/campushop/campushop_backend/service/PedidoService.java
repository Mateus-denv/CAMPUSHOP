package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.PedidoCreateRequestDTO;
import br.com.campushop.campushop_backend.dto.PedidoItemRequestDTO;
import br.com.campushop.campushop_backend.dto.PedidoItemResponseDTO;
import br.com.campushop.campushop_backend.dto.PedidoResponseDTO;
import br.com.campushop.campushop_backend.dto.PedidoStatusUpdateDTO;
import br.com.campushop.campushop_backend.entity.ItemPedido;
import br.com.campushop.campushop_backend.entity.Pedido;
import br.com.campushop.campushop_backend.entity.Produto;
import br.com.campushop.campushop_backend.entity.Usuario;
import br.com.campushop.campushop_backend.enums.StatusPedido;
import br.com.campushop.campushop_backend.enums.TipoUsuario;
import br.com.campushop.campushop_backend.exception.BusinessException;
import br.com.campushop.campushop_backend.exception.ResourceNotFoundException;
import br.com.campushop.campushop_backend.exception.UnauthorizedOperationException;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioService usuarioService;

    public PedidoService(PedidoRepository pedidoRepository,
            ProdutoRepository produtoRepository,
            UsuarioService usuarioService) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional
    @SuppressWarnings("null")
    public PedidoResponseDTO criarPedido(PedidoCreateRequestDTO request, String emailAutenticado) {
        Usuario cliente = usuarioService.buscarPorEmailOuFalhar(emailAutenticado);
        validarCliente(cliente);

        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new BusinessException("Não é permitido criar pedido sem itens");
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setData(LocalDateTime.now());
        pedido.setStatus(StatusPedido.CRIADO);

        List<ItemPedido> itens = new ArrayList<>();
        for (PedidoItemRequestDTO itemRequest : request.getItens()) {
            Objects.requireNonNull(itemRequest.getProdutoId(), "Produto do item é obrigatório");
            Produto produto = produtoRepository.findById(itemRequest.getProdutoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produto não encontrado: " + itemRequest.getProdutoId()));

            if (produto.getEstoque() < itemRequest.getQuantidade()) {
                throw new BusinessException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            produto.setEstoque(produto.getEstoque() - itemRequest.getQuantidade());

            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemRequest.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());
            itens.add(item);
        }

        pedido.setItens(itens);
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        return toResponse(pedidoSalvo);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosDoCliente(String emailAutenticado) {
        Usuario cliente = usuarioService.buscarPorEmailOuFalhar(emailAutenticado);
        validarCliente(cliente);

        return pedidoRepository.findByClienteIdOrderByDataDesc(cliente.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @SuppressWarnings("null")
    public PedidoResponseDTO atualizarStatus(Long pedidoId, PedidoStatusUpdateDTO request, String emailAutenticado) {
        Objects.requireNonNull(pedidoId, "Id do pedido é obrigatório");
        Usuario usuario = usuarioService.buscarPorEmailOuFalhar(emailAutenticado);
        if (usuario.getTipoUsuario() != TipoUsuario.VENDEDOR) {
            throw new UnauthorizedOperationException("Apenas VENDEDOR pode atualizar status de pedido");
        }

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado: " + pedidoId));

        boolean vendedorParticipaDoPedido = pedido.getItens().stream()
                .anyMatch(item -> item.getProduto().getVendedor().getId().equals(usuario.getId()));

        if (!vendedorParticipaDoPedido) {
            throw new UnauthorizedOperationException(
                    "Vendedor só pode atualizar pedidos contendo seus próprios produtos");
        }

        pedido.setStatus(request.getStatus());
        return toResponse(pedidoRepository.save(pedido));
    }

    private void validarCliente(Usuario cliente) {
        if (cliente.getTipoUsuario() != TipoUsuario.CLIENTE) {
            throw new UnauthorizedOperationException("Apenas usuários CLIENTE podem criar e listar pedidos próprios");
        }
    }

    private PedidoResponseDTO toResponse(Pedido pedido) {
        PedidoResponseDTO dto = new PedidoResponseDTO();
        dto.setId(pedido.getId());
        dto.setClienteId(pedido.getCliente().getId());
        dto.setClienteEmail(pedido.getCliente().getEmail());
        dto.setData(pedido.getData());
        dto.setStatus(pedido.getStatus());

        List<PedidoItemResponseDTO> itensResponse = pedido.getItens().stream().map(item -> {
            PedidoItemResponseDTO itemDto = new PedidoItemResponseDTO();
            itemDto.setItemId(item.getId());
            itemDto.setProdutoId(item.getProduto().getId());
            itemDto.setNomeProduto(item.getProduto().getNome());
            itemDto.setQuantidade(item.getQuantidade());
            itemDto.setPrecoUnitario(item.getPrecoUnitario());
            itemDto.setSubtotal(item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade())));
            return itemDto;
        }).toList();

        BigDecimal total = itensResponse.stream()
                .map(PedidoItemResponseDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setItens(itensResponse);
        dto.setValorTotal(total);

        return dto;
    }
}
