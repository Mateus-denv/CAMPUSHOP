package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.PedidoResponse;
import br.com.campushop.campushop_backend.dto.UpdatePedidoStatusRequest;
import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.PedidoItem;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class PedidoService {

    private static final String STATUS_EM_ANALISE = "em analise";
    private static final String STATUS_ACEITO = "aceito";
    private static final String STATUS_REJEITADO = "rejeitado";
    private static final String STATUS_ENTREGUE = "entregue";
    private static final String STATUS_INVALIDO = "invalido";
    private static final String MOTIVO_FORA_ESTOQUE = "Fora de estoque";
    private static final String MOTIVO_PRAZO_EXPIRADO = "Prazo de entrega expirado";
    private static final int PRAZO_ENTREGA_DIAS = 15;

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioService usuarioService;
    private final CarrinhoService carrinhoService;

    public PedidoService(PedidoRepository pedidoRepository,
            ProdutoRepository produtoRepository,
            UsuarioService usuarioService,
            CarrinhoService carrinhoService) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioService = usuarioService;
        this.carrinhoService = carrinhoService;
    }

    @Transactional
    public List<PedidoResponse> confirmarPedidosDoCarrinho(String emailUsuario) {
        Usuario comprador = usuarioService.buscarPorEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Carrinho> itensCarrinho = carrinhoService.listarPorUsuario(comprador.getId());
        if (itensCarrinho.isEmpty()) {
            throw new RuntimeException("Adicione produtos no carrinho antes de confirmar o pedido");
        }

        Map<Integer, GrupoPedido> grupos = agruparPorVendedor(itensCarrinho);
        List<Pedido> pedidosCriados = new ArrayList<>();

        for (GrupoPedido grupo : grupos.values()) {
            Pedido pedido = new Pedido();
            pedido.setUsuario(comprador);
            pedido.setVendedor(grupo.vendedor());
            // A chave só é criada depois que o vendedor aprova o pedido.
            pedido.setChaveEntrega(null);
            pedido.setDataAprovacao(null);
            pedido.setPrazoEntregaLimite(null);
            pedido.setDataEntrega(null);
            pedido.setDataInvalidacao(null);
            pedido.setStatusPedido(STATUS_EM_ANALISE);
            pedido.setDataPedido(LocalDateTime.now());
            pedido.setValorPedido(grupo.total());

            for (ItemPedido itemPedido : grupo.itens()) {
                PedidoItem pedidoItem = new PedidoItem();
                pedidoItem.setProduto(itemPedido.produto());
                pedidoItem.setQuantidade(itemPedido.quantidade());
                pedidoItem.setPrecoUnitario(BigDecimal.valueOf(itemPedido.produto().getPreco()));
                pedido.adicionarItem(pedidoItem);
            }

            pedidosCriados.add(pedidoRepository.save(pedido));
        }

        carrinhoService.limparCarrinho(comprador.getId());
        return pedidosCriados.stream().map(PedidoResponse::fromEntity).toList();
    }

    @Transactional
    public List<PedidoResponse> listarPedidosDoComprador(String emailUsuario) {
        List<Pedido> pedidos = pedidoRepository.findByCompradorEmail(emailUsuario);
        atualizarPedidosVencidos(pedidos);

        return pedidos.stream()
                .map(PedidoResponse::fromEntity)
                .toList();
    }

    @Transactional
    public List<PedidoResponse> listarPedidosDoVendedor(String emailUsuario) {
        List<Pedido> pedidos = pedidoRepository.findByVendedorEmail(emailUsuario);
        atualizarPedidosVencidos(pedidos);

        return pedidos.stream()
                .map(PedidoResponse::fromEntity)
                .toList();
    }

    @Transactional
    public long contarPedidosPendentesDoVendedor(String emailUsuario) {
        List<Pedido> pedidos = pedidoRepository.findByVendedorEmail(emailUsuario);
        atualizarPedidosVencidos(pedidos);

        return pedidos.stream()
                .filter(pedido -> STATUS_EM_ANALISE.equalsIgnoreCase(pedido.getStatusPedido()))
                .count();
    }

    @Transactional
    public PedidoResponse atualizarStatus(Integer pedidoId, String emailUsuario, UpdatePedidoStatusRequest request) {
        Pedido pedido = pedidoRepository.findDetalhadoById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        Usuario vendedor = usuarioService.buscarPorEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (pedido.getVendedor() == null || pedido.getVendedor().getId() == null
                || !pedido.getVendedor().getId().equals(vendedor.getId())) {
            throw new RuntimeException("Somente o vendedor responsável pode atualizar este pedido");
        }

        String novoStatus = normalizeStatus(request.status());
        if (STATUS_ACEITO.equals(novoStatus)) {
            aceitarPedido(pedido);
        } else if (STATUS_REJEITADO.equals(novoStatus)) {
            pedido.setStatusPedido(STATUS_REJEITADO);
            pedido.setMotivoRejeicao(null);
            pedido.setChaveEntrega(null);
            pedido.setDataAprovacao(null);
            pedido.setPrazoEntregaLimite(null);
            pedido.setDataEntrega(null);
            pedido.setDataInvalidacao(null);
            pedidoRepository.save(pedido);
        } else if (STATUS_ENTREGUE.equals(novoStatus)) {
            entregarPedido(pedido, request.codigoAcesso());
        } else {
            throw new RuntimeException("Status de pedido inválido");
        }

        Pedido atualizado = pedidoRepository.findDetalhadoById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado após atualização"));
        return PedidoResponse.fromEntity(atualizado);
    }

    private void aceitarPedido(Pedido pedido) {
        pedido.setStatusPedido(STATUS_ACEITO);
        pedido.setMotivoRejeicao(null);
        // A geração acontece no momento da aprovação para que o comprador receba um código válido.
        pedido.setChaveEntrega(gerarChaveEntrega());
        LocalDateTime agora = LocalDateTime.now();
        pedido.setDataAprovacao(agora);
        pedido.setPrazoEntregaLimite(agora.plusDays(PRAZO_ENTREGA_DIAS));
        pedido.setDataEntrega(null);
        pedido.setDataInvalidacao(null);

        for (PedidoItem item : pedido.getItens()) {
            Produto produto = item.getProduto();
            Integer estoqueAtual = produto.getEstoque() != null ? produto.getEstoque() : 0;
            Integer quantidadeSolicitada = item.getQuantidade() != null ? item.getQuantidade() : 0;

            if (estoqueAtual < quantidadeSolicitada) {
                throw new RuntimeException("Estoque insuficiente para confirmar o pedido");
            }

            produto.setEstoque(estoqueAtual - quantidadeSolicitada);
            if (produto.getEstoque() == 0) {
                produto.setStatus("FORA_DE_ESTOQUE");
            }

            produtoRepository.save(produto);

            if (produto.getEstoque() != null && produto.getEstoque() == 0) {
                rejeitarConcorrentesPorProduto(pedido, produto.getIdProduto());
            }
        }

        pedidoRepository.save(pedido);
    }

    private void entregarPedido(Pedido pedido, String codigoInformado) {
        if (pedido.getChaveEntrega() == null) {
            throw new RuntimeException("O pedido precisa ser aprovado antes da entrega");
        }

        invalidarSeVencido(pedido, LocalDateTime.now());
        if (STATUS_INVALIDO.equalsIgnoreCase(pedido.getStatusPedido())) {
            throw new RuntimeException("O prazo de entrega expirou e a compra foi invalidada");
        }

        String codigoNormalizado = normalizarCodigoEntrega(codigoInformado);
        if (!pedido.getChaveEntrega().equalsIgnoreCase(codigoNormalizado)) {
            throw new RuntimeException("Código de acesso inválido");
        }

        // A entrega só é concluída quando o código apresentado bate com o código gerado na aprovação.
        pedido.setStatusPedido(STATUS_ENTREGUE);
        pedido.setMotivoRejeicao(null);
        pedido.setDataEntrega(LocalDateTime.now());
        pedidoRepository.save(pedido);
    }

    private void atualizarPedidosVencidos(List<Pedido> pedidos) {
        LocalDateTime agora = LocalDateTime.now();

        for (Pedido pedido : pedidos) {
            invalidarSeVencido(pedido, agora);
        }
    }

    private void invalidarSeVencido(Pedido pedido, LocalDateTime agora) {
        if (!STATUS_ACEITO.equalsIgnoreCase(pedido.getStatusPedido())) {
            return;
        }

        LocalDateTime prazoEntregaLimite = pedido.getPrazoEntregaLimite();
        if (prazoEntregaLimite == null || !agora.isAfter(prazoEntregaLimite)) {
            return;
        }

        pedido.setStatusPedido(STATUS_INVALIDO);
        pedido.setMotivoRejeicao(MOTIVO_PRAZO_EXPIRADO);
        pedido.setDataInvalidacao(agora);
        pedidoRepository.save(pedido);
    }

    private void rejeitarConcorrentesPorProduto(Pedido pedidoAtual, Integer produtoId) {
        List<Pedido> concorrentes = pedidoRepository.findPendentesPorProduto(
                pedidoAtual.getVendedor().getId(),
                produtoId,
                pedidoAtual.getIdPedido());

        for (Pedido concorrente : concorrentes) {
            concorrente.setStatusPedido(STATUS_REJEITADO);
            concorrente.setMotivoRejeicao(MOTIVO_FORA_ESTOQUE);
            pedidoRepository.save(concorrente);
        }
    }

    private Map<Integer, GrupoPedido> agruparPorVendedor(List<Carrinho> itensCarrinho) {
        Map<Integer, GrupoPedido> grupos = new LinkedHashMap<>();

        for (Carrinho item : itensCarrinho) {
            Produto produto = item.getProduto();
            Usuario vendedor = Optional.ofNullable(produto.getUsuario())
                    .orElseThrow(() -> new RuntimeException("Produto sem vendedor associado"));

            Integer vendedorId = vendedor.getId();
            if (!grupos.containsKey(vendedorId)) {
                grupos.put(vendedorId, new GrupoPedido(vendedor, new ArrayList<>(), BigDecimal.ZERO));
            }

            GrupoPedido grupoAtual = grupos.get(vendedorId);
            grupoAtual.itens().add(new ItemPedido(produto, item.getQuantidade()));
            BigDecimal subtotal = BigDecimal.valueOf(produto.getPreco())
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));
            grupoAtual.setTotal(grupoAtual.total().add(subtotal));
        }

        return grupos;
    }

    private String gerarChaveEntrega() {
        String letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        Random random = new Random();
        String chave;

        do {
            chave = ""
                    + letras.charAt(random.nextInt(letras.length()))
                    + random.nextInt(10)
                    + letras.charAt(random.nextInt(letras.length()))
                    + random.nextInt(10)
                    + letras.charAt(random.nextInt(letras.length()))
                    + random.nextInt(10)
                    + random.nextInt(10)
                    + random.nextInt(10);
        } while (pedidoRepository.existsByChaveEntrega(chave));

        return chave;
    }

    private String normalizarCodigoEntrega(String codigoInformado) {
        if (codigoInformado == null || codigoInformado.trim().isEmpty()) {
            throw new RuntimeException("Código de acesso é obrigatório para concluir a entrega");
        }

        return codigoInformado.trim().toUpperCase();
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            throw new RuntimeException("Status de pedido é obrigatório");
        }

        return switch (status.trim().toLowerCase()) {
            case STATUS_ACEITO -> STATUS_ACEITO;
            case STATUS_REJEITADO -> STATUS_REJEITADO;
            case STATUS_ENTREGUE -> STATUS_ENTREGUE;
            case STATUS_EM_ANALISE -> STATUS_EM_ANALISE;
            case STATUS_INVALIDO -> STATUS_INVALIDO;
            default -> throw new RuntimeException("Status de pedido inválido");
        };
    }

    private record ItemPedido(Produto produto, Integer quantidade) {
    }

    private static class GrupoPedido {
        private final Usuario vendedor;
        private final List<ItemPedido> itens;
        private BigDecimal total;

        private GrupoPedido(Usuario vendedor, List<ItemPedido> itens, BigDecimal total) {
            this.vendedor = vendedor;
            this.itens = itens;
            this.total = total;
        }

        public Usuario vendedor() {
            return vendedor;
        }

        public List<ItemPedido> itens() {
            return itens;
        }

        public BigDecimal total() {
            return total;
        }

        public void setTotal(BigDecimal total) {
            this.total = total;
        }
    }
}