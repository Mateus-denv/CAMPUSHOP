package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.*;
import br.com.campushop.campushop_backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CarrinhoService {

    private static final Logger logger = LoggerFactory.getLogger(CarrinhoService.class);

    private final CarrinhoRepository carrinhoRepository;
    private final ItemCarrinhoRepository itemCarrinhoRepository;
    private final ProdutoRepository produtoRepository;
    private final PedidoRepository pedidoRepository;
    private final ItemPedidoRepository itemPedidoRepository;

    @Autowired
    public CarrinhoService(
            CarrinhoRepository carrinhoRepository,
            ItemCarrinhoRepository itemCarrinhoRepository,
            ProdutoRepository produtoRepository,
            PedidoRepository pedidoRepository,
            ItemPedidoRepository itemPedidoRepository) {
        this.carrinhoRepository = carrinhoRepository;
        this.itemCarrinhoRepository = itemCarrinhoRepository;
        this.produtoRepository = produtoRepository;
        this.pedidoRepository = pedidoRepository;
        this.itemPedidoRepository = itemPedidoRepository;
    }

    /**
     * Obtém ou cria o carrinho para um usuário cliente
     */
    public Carrinho obterCarrinhoPorCliente(Usuario cliente) {
        logger.info("Buscando carrinho para cliente: {}", cliente.getId());

        if (!"comprador".equalsIgnoreCase(cliente.getPerfil())) {
            logger.error("Usuário não é cliente: {}", cliente.getId());
            throw new IllegalArgumentException("Apenas usuários do tipo CLIENTE podem ter carrinho");
        }

        return carrinhoRepository.findByCliente(cliente)
                .orElseGet(() -> criarCarrinho(cliente));
    }

    /**
     * Cria um novo carrinho para um cliente
     */
    private Carrinho criarCarrinho(Usuario cliente) {
        logger.info("Criando novo carrinho para cliente: {}", cliente.getId());
        Carrinho carrinho = new Carrinho(cliente);
        return carrinhoRepository.save(carrinho);
    }

    /**
     * REGRA 1: Adiciona produto ao carrinho ou aumenta quantidade se já existe
     */
    public ItemCarrinho adicionarProdutoAoCarrinho(Usuario cliente, Long produtoId, Integer quantidade) {
        logger.info("Adicionando produto {} ao carrinho do cliente {}", produtoId, cliente.getId());

        // Validar cliente
        Carrinho carrinho = obterCarrinhoPorCliente(cliente);

        // Validar quantidade
        if (quantidade == null || quantidade <= 0) {
            logger.error("Quantidade inválida: {}", quantidade);
            throw new IllegalArgumentException("Quantidade deve ser maior que 0");
        }

        // Buscar produto
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        logger.info("Produto encontrado: {}", produto.getNome());

        // REGRA: Se produto já existe no carrinho, aumenta quantidade
        Optional<ItemCarrinho> itemExistente = itemCarrinhoRepository.findByCarrinhoAndProduto(carrinho, produto);

        if (itemExistente.isPresent()) {
            ItemCarrinho item = itemExistente.get();
            Integer novaQuantidade = item.getQuantidade() + quantidade;

            // REGRA: Não permitir quantidade maior que estoque
            if (novaQuantidade > produto.getEstoque()) {
                logger.warn("Quantidade solicitada {} ultrapassa estoque {}", novaQuantidade, produto.getEstoque());
                throw new IllegalArgumentException(
                        "Quantidade indisponível em estoque. Máximo: " + produto.getEstoque());
            }

            item.setQuantidade(novaQuantidade);
            item.setDataAtualizacao(java.time.LocalDateTime.now());
            ItemCarrinho itemAtualizado = itemCarrinhoRepository.save(item);
            logger.info("Quantidade do item atualizada para: {}", novaQuantidade);
            return itemAtualizado;
        }

        // REGRA: Validar estoque
        if (quantidade > produto.getEstoque()) {
            logger.warn("Quantidade solicitada {} ultrapassa estoque {}", quantidade, produto.getEstoque());
            throw new IllegalArgumentException("Quantidade indisponível em estoque. Máximo: " + produto.getEstoque());
        }

        // Criar novo item no carrinho
        ItemCarrinho novoItem = new ItemCarrinho(carrinho, produto, quantidade);
        carrinho.adicionarItem(novoItem);
        ItemCarrinho itemSalvo = itemCarrinhoRepository.save(novoItem);
        logger.info("Novo item adicionado ao carrinho: {}", itemSalvo.getId());

        return itemSalvo;
    }

    /**
     * REGRA: Atualiza quantidade ou remove item se quantidade for 0
     */
    public void atualizarQuantidadeItem(Usuario cliente, Long itemId, Integer novaQuantidade) {
        logger.info("Atualizando quantidade do item {} para {}", itemId, novaQuantidade);

        Carrinho carrinho = obterCarrinhoPorCliente(cliente);

        ItemCarrinho item = itemCarrinhoRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado no carrinho"));

        // Validar que o item pertence ao carrinho do cliente
        if (!item.getCarrinho().getId().equals(carrinho.getId())) {
            logger.error("Item não pertence ao carrinho do cliente");
            throw new IllegalArgumentException("Item não pertence ao seu carrinho");
        }

        // REGRA: Se quantidade for 0, remover item
        if (novaQuantidade == null || novaQuantidade == 0) {
            logger.info("Removendo item do carrinho");
            removerItemDoCarrinho(cliente, itemId);
            return;
        }

        // REGRA: Validar quantidade positiva
        if (novaQuantidade < 0) {
            logger.error("Quantidade negativa: {}", novaQuantidade);
            throw new IllegalArgumentException("Quantidade deve ser maior ou igual a 0");
        }

        // REGRA: Validar estoque
        if (novaQuantidade > item.getProduto().getEstoque()) {
            logger.warn("Quantidade {} ultrapassa estoque {}", novaQuantidade, item.getProduto().getEstoque());
            throw new IllegalArgumentException(
                    "Quantidade indisponível em estoque. Máximo: " + item.getProduto().getEstoque());
        }

        item.setQuantidade(novaQuantidade);
        item.setDataAtualizacao(java.time.LocalDateTime.now());
        itemCarrinhoRepository.save(item);
        logger.info("Item atualizado com sucesso");
    }

    /**
     * Remove um item do carrinho
     */
    public void removerItemDoCarrinho(Usuario cliente, Long itemId) {
        logger.info("Removendo item {} do carrinho", itemId);

        Carrinho carrinho = obterCarrinhoPorCliente(cliente);

        ItemCarrinho item = itemCarrinhoRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));

        if (!item.getCarrinho().getId().equals(carrinho.getId())) {
            logger.error("Item não pertence ao carrinho do cliente");
            throw new IllegalArgumentException("Item não pertence ao seu carrinho");
        }

        carrinho.removerItem(item);
        itemCarrinhoRepository.deleteById(itemId);
        logger.info("Item removido com sucesso");
    }

    /**
     * Lista todos os itens do carrinho
     */
    @Transactional(readOnly = true)
    public List<ItemCarrinho> listarItensCarrinho(Usuario cliente) {
        logger.info("Listando itens do carrinho para cliente: {}", cliente.getId());

        Carrinho carrinho = obterCarrinhoPorCliente(cliente);
        return itemCarrinhoRepository.findByCarrinho(carrinho);
    }

    /**
     * Calcula o total do carrinho
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalCarrinho(Usuario cliente) {
        logger.info("Calculando total do carrinho para cliente: {}", cliente.getId());

        List<ItemCarrinho> itens = listarItensCarrinho(cliente);

        BigDecimal total = BigDecimal.ZERO;
        for (ItemCarrinho item : itens) {
            total = total.add(item.getSubtotal());
        }

        logger.info("Total do carrinho: {}", total);
        return total;
    }

    /**
     * REGRA: Finaliza a compra - Cria pedido, reduz estoque e limpa carrinho
     */
    public Pedido finalizarCompra(Usuario cliente) {
        logger.info("Finalizando compra para cliente: {}", cliente.getId());

        Carrinho carrinho = obterCarrinhoPorCliente(cliente);

        // REGRA: Não permitir finalizar compra com carrinho vazio
        if (!carrinho.temItens()) {
            logger.warn("Tentativa de finalizar compra com carrinho vazio");
            throw new IllegalArgumentException("Carrinho está vazio. Adicione produtos antes de finalizar.");
        }

        // Calcular total
        BigDecimal totalPedido = calcularTotalCarrinho(cliente);

        // REGRA: Criar Pedido
        Pedido pedido = new Pedido(cliente, totalPedido);

        // REGRA: Criar ItemPedido para cada item e reduzir estoque
        for (ItemCarrinho item : carrinho.getItens()) {
            // Salvar preço do produto no momento da compra
            ItemPedido itemPedido = new ItemPedido(
                    pedido,
                    item.getProduto(),
                    item.getQuantidade(),
                    item.getPrecoUnitario());
            pedido.adicionarItem(itemPedido);

            // REGRA: Reduzir estoque
            Produto produto = item.getProduto();
            Integer estoqueAtual = produto.getEstoque();
            produto.setEstoque(estoqueAtual - item.getQuantidade());
            produto.setDataAtualizacao(java.time.LocalDateTime.now());
            produtoRepository.save(produto);

            logger.info("Estoque reduzido para produto {}: {} unidades", produto.getId(), item.getQuantidade());
        }

        // Salvar pedido com itens
        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        logger.info("Pedido criado com sucesso. ID: {}", pedidoSalvo.getId());

        // REGRA: Limpar carrinho após a compra
        carrinho.limpar();
        carrinhoRepository.save(carrinho);
        logger.info("Carrinho limpo após finalização da compra");

        return pedidoSalvo;
    }

    /**
     * Limpa o carrinho do cliente
     */
    public void limparCarrinho(Usuario cliente) {
        logger.info("Limpando carrinho do cliente: {}", cliente.getId());

        Carrinho carrinho = obterCarrinhoPorCliente(cliente);
        carrinho.limpar();
        carrinhoRepository.save(carrinho);
    }

}
