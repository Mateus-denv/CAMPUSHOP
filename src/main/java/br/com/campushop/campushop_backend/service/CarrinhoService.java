package br.com.campushop.campushop_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public List<Carrinho> listarPorUsuario(Integer usuarioId) {
        return carrinhoRepository.findByUsuarioId(usuarioId);
    }

    private void validarQuantidadeSolicitada(Integer quantidade) {
        // A quantidade precisa ser positiva para evitar itens vazios no carrinho.
        if (quantidade == null || quantidade <= 0) {
            throw new IllegalArgumentException("A quantidade deve ser maior que zero");
        }
    }

    private void validarEstoqueDisponivel(Produto produto, Integer quantidadeSolicitada) {
        validarQuantidadeSolicitada(quantidadeSolicitada);

        // Impede reservar mais do que o saldo atual do produto.
        if (produto.getEstoque() == null || produto.getEstoque() < quantidadeSolicitada) {
            throw new IllegalArgumentException("Quantidade solicitada ultrapassa o estoque disponível");
        }
    }

    // Adicionar item ao carrinho
    public Carrinho adicionarAoCarrinho(Integer usuarioId, Produto produto, Integer quantidade) {
        // O vendedor não pode adicionar o próprio produto ao carrinho, porque isso seria uma compra inválida.
        if (produto != null && produto.getUsuario() != null && produto.getUsuario().getId() != null
                && produto.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Você não pode comprar este produto porque ele pertence ao seu anúncio");
        }

        validarEstoqueDisponivel(produto, quantidade);

        // Verificar se o produto já está no carrinho
        List<Carrinho> itens = listarPorUsuario(usuarioId);

        for (Carrinho item : itens) {
            if (item.getProduto().getIdProduto().equals(produto.getIdProduto())) {
                int quantidadeAtualizada = item.getQuantidade() + quantidade;

                // A soma precisa continuar dentro do estoque para não criar reserva inválida.
                if (quantidadeAtualizada > produto.getEstoque()) {
                    throw new IllegalArgumentException("Quantidade solicitada ultrapassa o estoque disponível");
                }

                item.setQuantidade(quantidadeAtualizada);
                return carrinhoRepository.save(item);
            }
        }

        // Produto não existe, criar novo item
        Carrinho novoItem = new Carrinho();
        novoItem.setQuantidade(quantidade);
        novoItem.setProduto(produto);

        // Buscar a entidade Usuario e associá-la ao item do carrinho antes de salvar.
        // Sem essa associação, o campo id_usuario na tabela ficava nulo, causando
        // SQLIntegrityConstraintViolationException (coluna não-nula).
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado ao adicionar ao carrinho"));
        novoItem.setUsuario(usuario);

        return carrinhoRepository.save(novoItem);
    }

    // Remover item do carrinho
    public void removerDoCarrinho(Integer carrinhoId, Integer usuarioId) {
        Optional<Carrinho> item = carrinhoRepository.findById(carrinhoId);

        if (item.isPresent() && item.get().getUsuario().getId().equals(usuarioId)) {
            carrinhoRepository.deleteById(carrinhoId);
        } else {
            throw new RuntimeException("Item não encontrado ou não pertence ao usuário");
        }
    }

    // Atualizar quantidade
    public Carrinho atualizarQuantidade(Integer carrinhoId, Integer novaQuantidade, Integer usuarioId) {
        Optional<Carrinho> item = carrinhoRepository.findById(carrinhoId);

        if (item.isPresent() && item.get().getUsuario().getId().equals(usuarioId)) {
            validarEstoqueDisponivel(item.get().getProduto(), novaQuantidade);

            // Mantém o item salvo, mas impede zerar ou extrapolar o estoque.
            item.get().setQuantidade(novaQuantidade);
            return carrinhoRepository.save(item.get());
        } else {
            throw new RuntimeException("Item não encontrado ou não pertence ao usuário");
        }
    }

    // Limpar carrinho inteiro
    @Transactional
    public void limparCarrinho(Integer usuarioId) {
        // Garantir que o delete seja executado dentro de uma transação para
        // evitar TransactionRequiredException quando o EntityManager for usado.
        carrinhoRepository.deleteByUsuarioId(usuarioId);
    }

    // Calcular total do carrinho
    public Double calcularTotal(Integer usuarioId) {
        List<Carrinho> itens = listarPorUsuario(usuarioId);

        return itens.stream()
                .mapToDouble(item -> item.getProduto().getPreco() * item.getQuantidade())
                .sum();
    }

    // Valida se há estoque suficiente para o item  
    public boolean validarEstoque(Produto produto, Integer quantidade) {
        return quantidade != null && quantidade > 0 && produto.getEstoque() >= quantidade;
    }
    
}
