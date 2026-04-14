package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.ProdutoRequestDTO;
import br.com.campushop.campushop_backend.dto.ProdutoResponseDTO;
import br.com.campushop.campushop_backend.entity.Produto;
import br.com.campushop.campushop_backend.entity.Usuario;
import br.com.campushop.campushop_backend.enums.TipoUsuario;
import br.com.campushop.campushop_backend.exception.ResourceNotFoundException;
import br.com.campushop.campushop_backend.exception.UnauthorizedOperationException;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final UsuarioService usuarioService;

    public ProdutoService(ProdutoRepository produtoRepository, UsuarioService usuarioService) {
        this.produtoRepository = produtoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO request, String emailAutenticado) {
        Usuario vendedor = usuarioService.buscarPorEmailOuFalhar(emailAutenticado);
        validarVendedor(vendedor);

        Produto produto = new Produto();
        aplicarDadosProduto(produto, request);
        produto.setVendedor(vendedor);

        return toResponse(produtoRepository.save(produto));
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarTodos() {
        return produtoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosDoVendedor(String emailAutenticado) {
        Usuario vendedor = usuarioService.buscarPorEmailOuFalhar(emailAutenticado);
        validarVendedor(vendedor);

        return produtoRepository.findByVendedorId(vendedor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @SuppressWarnings("null")
    public ProdutoResponseDTO atualizarProduto(Long produtoId, ProdutoRequestDTO request, String emailAutenticado) {
        Objects.requireNonNull(produtoId, "Id do produto é obrigatório");
        Usuario vendedor = usuarioService.buscarPorEmailOuFalhar(emailAutenticado);
        validarVendedor(vendedor);

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + produtoId));

        validarDonoDoProduto(produto, vendedor);
        aplicarDadosProduto(produto, request);

        Produto produtoAtualizado = produtoRepository.save(produto);
        return toResponse(produtoAtualizado);
    }

    @Transactional
    @SuppressWarnings("null")
    public void deletarProduto(Long produtoId, String emailAutenticado) {
        Objects.requireNonNull(produtoId, "Id do produto é obrigatório");
        Usuario vendedor = usuarioService.buscarPorEmailOuFalhar(emailAutenticado);
        validarVendedor(vendedor);

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + produtoId));

        validarDonoDoProduto(produto, vendedor);
        produtoRepository.delete(produto);
    }

    private void aplicarDadosProduto(Produto produto, ProdutoRequestDTO request) {
        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setEstoque(request.getEstoque());
    }

    private void validarVendedor(Usuario usuario) {
        if (usuario.getTipoUsuario() != TipoUsuario.VENDEDOR) {
            throw new UnauthorizedOperationException("Apenas usuários do tipo VENDEDOR podem gerenciar produtos");
        }
    }

    private void validarDonoDoProduto(Produto produto, Usuario vendedor) {
        if (!produto.getVendedor().getId().equals(vendedor.getId())) {
            throw new UnauthorizedOperationException("Vendedor só pode alterar seus próprios produtos");
        }
    }

    private ProdutoResponseDTO toResponse(Produto produto) {
        ProdutoResponseDTO dto = new ProdutoResponseDTO();
        dto.setId(produto.getId());
        dto.setNome(produto.getNome());
        dto.setDescricao(produto.getDescricao());
        dto.setPreco(produto.getPreco());
        dto.setEstoque(produto.getEstoque());
        dto.setVendedorId(produto.getVendedor().getId());
        dto.setVendedorEmail(produto.getVendedor().getEmail());
        return dto;
    }
}
