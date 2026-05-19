package br.com.campushop.campushop_backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.campushop.campushop_backend.exception.BusinessException;
import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.CarrinhoRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;

@Service
public class CarrinhoService {

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository; // usado para buscar entidade Usuario por id

    // Listar itens do carrinho por usuário
    public List<Carrinho> listarPorUsuario(int usuarioId) {
        return carrinhoRepository.findByUsuarioId(usuarioId);
    }

    // Adicionar item ao carrinho
    public Carrinho adicionarAoCarrinho(int usuarioId, Produto produto, Integer quantidade) {
        // Verificar se o produto já está no carrinho
        List<Carrinho> itens = listarPorUsuario(idUsuario);

        for (Carrinho item : itens) {
            if (item.getProduto().getIdProduto().equals(produto.getIdProduto())) {
                // Produto já existe, validar estoque antes de somar a quantidade.
                int quantidadeAtualizada = item.getQuantidade() + quantidade;
                if (!validarEstoque(produto, quantidadeAtualizada)) {
                    throw new BusinessException("Quantidade solicitada excede o estoque disponível.");
                }
                item.setQuantidade(quantidadeAtualizada);
                return carrinhoRepository.save(item);
            }
        }

        if (quantidade == null || quantidade <= 0) {
            throw new BusinessException("Quantidade deve ser maior que zero.");
        }
        if (!validarEstoque(produto, quantidade)) {
            throw new BusinessException("Quantidade solicitada excede o estoque disponível.");
        }

        // Produto não existe, criar novo item
        Carrinho novoItem = new Carrinho();
        novoItem.setQuantidade(quantidade);
        novoItem.setProduto(produto);

        // Buscar a entidade Usuario e associá-la ao item do carrinho antes de salvar.
        // Sem essa associação, o campo id_usuario na tabela ficava nulo, causando
        // SQLIntegrityConstraintViolationException (coluna não-nula).
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado ao adicionar ao carrinho"));
        novoItem.setUsuario(usuario);

        return carrinhoRepository.save(novoItem);
    }

    // Remover item do carrinho
    public void removerDoCarrinho(int carrinhoId, int usuarioId) {
        Optional<Carrinho> item = carrinhoRepository.findById(carrinhoId);

        if (item.getUsuario().getId().equals(idUsuario)) {
            carrinhoRepository.deleteById(idCarrinho);
        } else {
            throw new RuntimeException("Item não encontrado ou não pertence ao usuário");
        }
    }

    // Atualizar quantidade
    public Carrinho atualizarQuantidade(int carrinhoId, Integer novaQuantidade, int usuarioId) {
        Optional<Carrinho> item = carrinhoRepository.findById(carrinhoId);

        if (item.isPresent() && item.get().getUsuario().getId().equals(usuarioId)) {
            Carrinho carrinho = item.get();
            if (novaQuantidade == null) {
                throw new BusinessException("Quantidade é obrigatória.");
            }
            if (novaQuantidade <= 0) {
                carrinhoRepository.deleteById(idCarrinho);
                return null;
            }
            if (!validarEstoque(carrinho.getProduto(), novaQuantidade)) {
                throw new BusinessException("Quantidade solicitada excede o estoque disponível.");
            }

            carrinho.setQuantidade(novaQuantidade);
            return carrinhoRepository.save(carrinho);
        } else {
            throw new BusinessException("Item não encontrado ou não pertence ao usuário");
        }
    }

    // Limpar carrinho inteiro
    @Transactional
    public void limparCarrinho(int usuarioId) {
        // Garantir que o delete seja executado dentro de uma transação para
        // evitar TransactionRequiredException quando o EntityManager for usado.
        carrinhoRepository.deleteByUsuarioId(usuarioId);
    }

    // Calcular total do carrinho
    public Double calcularTotal(int usuarioId) {
        List<Carrinho> itens = listarPorUsuario(usuarioId);

        return itens.stream()
                .mapToDouble(item -> item.getProduto().getPreco() * item.getQuantidade())
                .sum();
    }

    // Valida se há estoque suficiente para o item
    public boolean validarEstoque(Produto produto, Integer quantidade) {
        return produto != null && quantidade != null && quantidade > 0 && produto.getEstoque() >= quantidade;
    }

    private void validarQuantidadeSolicitada(Produto produto, Integer quantidade) {
        // Centraliza a regra para impedir que o carrinho aceite quantidade acima do
        // estoque.
        if (!validarEstoque(produto, quantidade)) {
            throw new RuntimeException("Quantidade solicitada excede o estoque disponível");
        }
    }

}
