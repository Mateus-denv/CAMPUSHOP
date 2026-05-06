package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Carrinho;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.CarrinhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CarrinhoService {
    
    @Autowired
    private CarrinhoRepository carrinhoRepository;
    
    // Listar itens do carrinho por usuário
    public List<Carrinho> listarPorUsuario(Integer usuarioId) {
        return carrinhoRepository.findByUsuarioId(usuarioId);
    }
    
    // Adicionar item ao carrinho
    public Carrinho adicionarAoCarrinho(Integer usuarioId, Produto produto, Integer quantidade) {
        // Verificar estoque disponível
        if (quantidade > produto.getEstoque()) {
            throw new RuntimeException("Quantidade solicitada (" + quantidade + ") excede o estoque disponível (" + produto.getEstoque() + ")");
        }
        
        // Verificar se o produto já está no carrinho
        List<Carrinho> itens = listarPorUsuario(usuarioId);
        
        for (Carrinho item : itens) {
            if (item.getProduto().getIdProduto().equals(produto.getIdProduto())) {
                // Produto já existe, verificar se nova quantidade excede estoque
                int novaQuantidade = item.getQuantidade() + quantidade;
                if (novaQuantidade > produto.getEstoque()) {
                    throw new RuntimeException("Quantidade total no carrinho (" + novaQuantidade + ") excede o estoque disponível (" + produto.getEstoque() + ")");
                }
                // Atualizar quantidade
                item.setQuantidade(novaQuantidade);
                return carrinhoRepository.save(item);
            }
        }
        
        // Produto não existe, criar novo item
        Carrinho novoItem = new Carrinho();
        novoItem.setQuantidade(quantidade);
        novoItem.setProduto(produto);
        
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
            if (novaQuantidade <= 0) {
                carrinhoRepository.deleteById(carrinhoId);
                return null;
            }
            
            item.get().setQuantidade(novaQuantidade);
            return carrinhoRepository.save(item.get());
        } else {
            throw new RuntimeException("Item não encontrado ou não pertence ao usuário");
        }
    }
    
    // Limpar carrinho inteiro
    public void limparCarrinho(Integer usuarioId) {
        carrinhoRepository.deleteByUsuarioId(usuarioId);
    }
    
    // Calcular total do carrinho
    public Double calcularTotal(Integer usuarioId) {
        List<Carrinho> itens = listarPorUsuario(usuarioId);
        
        return itens.stream()
            .mapToDouble(item -> item.getProduto().getPreco() * item.getQuantidade())
            .sum();
    }
}
