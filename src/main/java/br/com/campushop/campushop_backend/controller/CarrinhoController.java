package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.ItemCarrinho;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.CarrinhoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carrinho")
public class CarrinhoController {

    private static final Logger logger = LoggerFactory.getLogger(CarrinhoController.class);

    private final CarrinhoService carrinhoService;

    @Autowired
    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    /**
     * GET /api/carrinho
     * Retorna o carrinho do usuário logado com todos os itens
     */
    @GetMapping
    public ResponseEntity<?> obterCarrinho() {
        try {
            logger.info("Buscando carrinho do usuário");

            // TODO: Obter usuário autenticado
            // Usuario usuarioLogado = (Usuario)
            // SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            // Por enquanto, simulamos:
            Usuario usuarioLogado = new Usuario();
            usuarioLogado.setId(1L);
            usuarioLogado.setPerfil("comprador");

            Carrinho carrinho = carrinhoService.obterCarrinhoPorCliente(usuarioLogado);
            List<ItemCarrinho> itens = carrinhoService.listarItensCarrinho(usuarioLogado);
            BigDecimal total = carrinhoService.calcularTotalCarrinho(usuarioLogado);

            List<Map<String, Object>> itensResponse = itens.stream().map(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("quantidade", item.getQuantidade());
                itemMap.put("precoUnitario", item.getPrecoUnitario());
                itemMap.put("subtotal", item.getSubtotal());

                if (item.getProduto() != null) {
                    Map<String, Object> produtoMap = new HashMap<>();
                    produtoMap.put("id", item.getProduto().getId());
                    produtoMap.put("nome", item.getProduto().getNome());
                    produtoMap.put("preco", item.getProduto().getPreco());
                    itemMap.put("produto", produtoMap);
                }

                return itemMap;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("carrinhoId", carrinho.getId());
            response.put("itens", itensResponse);
            response.put("totalItens", itensResponse.size());
            response.put("totalCarrinho", total);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Erro ao obter carrinho: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro inesperado ao obter carrinho", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao buscar carrinho"));
        }
    }

    /**
     * POST /api/carrinho/adicionar
     * Adiciona um produto ao carrinho
     * Body: { "produtoId": 1, "quantidade": 2 }
     */
    @PostMapping("/adicionar")
    public ResponseEntity<?> adicionarProduto(@RequestBody Map<String, Object> request) {
        try {
            logger.info("Adicionando produto ao carrinho: {}", request);

            Long produtoId = ((Number) request.get("produtoId")).longValue();
            Integer quantidade = ((Number) request.get("quantidade")).intValue();

            // TODO: Obter usuário autenticado
            Usuario usuarioLogado = new Usuario();
            usuarioLogado.setId(1L);
            usuarioLogado.setPerfil("comprador");

            ItemCarrinho item = carrinhoService.adicionarProdutoAoCarrinho(usuarioLogado, produtoId, quantidade);

            Map<String, Object> itemResponse = new HashMap<>();
            itemResponse.put("id", item.getId());
            itemResponse.put("quantidade", item.getQuantidade());
            itemResponse.put("precoUnitario", item.getPrecoUnitario());
            itemResponse.put("subtotal", item.getSubtotal());

            if (item.getProduto() != null) {
                Map<String, Object> produtoMap = new HashMap<>();
                produtoMap.put("id", item.getProduto().getId());
                produtoMap.put("nome", item.getProduto().getNome());
                produtoMap.put("preco", item.getProduto().getPreco());
                itemResponse.put("produto", produtoMap);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Produto adicionado ao carrinho com sucesso");
            response.put("item", itemResponse);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Erro ao adicionar produto: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro inesperado ao adicionar produto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao adicionar produto"));
        }
    }

    /**
     * PUT /api/carrinho/item/{itemId}
     * Atualiza a quantidade de um item no carrinho
     * Body: { "quantidade": 5 }
     */
    @PutMapping("/item/{itemId}")
    public ResponseEntity<?> atualizarQuantidade(
            @PathVariable Long itemId,
            @RequestBody Map<String, Integer> request) {
        try {
            logger.info("Atualizando quantidade do item {}", itemId);

            Integer novaQuantidade = request.get("quantidade");

            // TODO: Obter usuário autenticado
            Usuario usuarioLogado = new Usuario();
            usuarioLogado.setId(1L);
            usuarioLogado.setPerfil("comprador");

            carrinhoService.atualizarQuantidadeItem(usuarioLogado, itemId, novaQuantidade);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Quantidade atualizada com sucesso");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Erro ao atualizar quantidade: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro inesperado ao atualizar quantidade", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao atualizar quantidade"));
        }
    }

    /**
     * DELETE /api/carrinho/item/{itemId}
     * Remove um item do carrinho
     */
    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<?> removerItem(@PathVariable Long itemId) {
        try {
            logger.info("Removendo item {} do carrinho", itemId);

            // TODO: Obter usuário autenticado
            Usuario usuarioLogado = new Usuario();
            usuarioLogado.setId(1L);
            usuarioLogado.setPerfil("comprador");

            carrinhoService.removerItemDoCarrinho(usuarioLogado, itemId);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Item removido com sucesso");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Erro ao remover item: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro inesperado ao remover item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao remover item"));
        }
    }

    /**
     * POST /api/carrinho/finalizar
     * Finaliza a compra e cria um pedido
     */
    @PostMapping("/finalizar")
    public ResponseEntity<?> finalizarCompra() {
        try {
            logger.info("Finalizando compra");

            // TODO: Obter usuário autenticado
            Usuario usuarioLogado = new Usuario();
            usuarioLogado.setId(1L);
            usuarioLogado.setPerfil("comprador");

            Pedido pedido = carrinhoService.finalizarCompra(usuarioLogado);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Compra finalizada com sucesso!");
            response.put("pedido", Map.of(
                    "id", pedido.getId(),
                    "total", pedido.getTotalPedido(),
                    "status", pedido.getStatusPedido(),
                    "data", pedido.getDataPedido()));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Erro ao finalizar compra: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro inesperado ao finalizar compra", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao finalizar compra"));
        }
    }

    /**
     * DELETE /api/carrinho/limpar
     * Limpa o carrinho do usuário
     */
    @DeleteMapping("/limpar")
    public ResponseEntity<?> limparCarrinho() {
        try {
            logger.info("Limpando carrinho");

            // TODO: Obter usuário autenticado
            Usuario usuarioLogado = new Usuario();
            usuarioLogado.setId(1L);
            usuarioLogado.setPerfil("comprador");

            carrinhoService.limparCarrinho(usuarioLogado);

            Map<String, Object> response = new HashMap<>();
            response.put("sucesso", true);
            response.put("mensagem", "Carrinho limpo com sucesso");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Erro inesperado ao limpar carrinho", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao limpar carrinho"));
        }
    }

}
