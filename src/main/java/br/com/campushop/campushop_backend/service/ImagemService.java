package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.ImagemAnexo;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.ImagemAnexoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ImagemService {

    private static final long MAX_SIZE_BYTES = 2L * 1024 * 1024;
    private static final Set<String> MIME_TYPES_PERMITIDOS = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/avif");
    private static final Set<String> EXTENSOES_PERMITIDAS = Set.of("jpg", "jpeg", "webp", "avif");
    private static final String TIPO_PERFIL = "PERFIL";
    private static final String TIPO_PRODUTO = "PRODUTO";

    private final ImagemAnexoRepository imagemAnexoRepository;

    public ImagemService(ImagemAnexoRepository imagemAnexoRepository) {
        this.imagemAnexoRepository = imagemAnexoRepository;
    }

    @Transactional
    public ImagemAnexo salvarFotoPerfil(Usuario usuario, MultipartFile imagem) {
        validarArquivo(imagem, "perfil");
        imagemAnexoRepository.deleteByUsuarioIdAndTipo(usuario.getId(), TIPO_PERFIL);

        ImagemAnexo imagemAnexo = criarImagem(imagem);
        imagemAnexo.setTipo(TIPO_PERFIL);
        imagemAnexo.setUsuario(usuario);
        return imagemAnexoRepository.save(imagemAnexo);
    }

    @Transactional
    public List<ImagemAnexo> salvarImagensProduto(Produto produto, List<MultipartFile> imagens) {
        if (imagens == null || imagens.isEmpty()) {
            throw new RuntimeException("Selecione ao menos uma imagem para o anúncio");
        }

        List<ImagemAnexo> imagensSalvas = new ArrayList<>();
        for (MultipartFile imagem : imagens) {
            validarArquivo(imagem, "produto");
            ImagemAnexo imagemAnexo = criarImagem(imagem);
            imagemAnexo.setTipo(TIPO_PRODUTO);
            imagemAnexo.setProduto(produto);
            imagensSalvas.add(imagemAnexoRepository.save(imagemAnexo));
        }

        return imagensSalvas;
    }

    public Optional<ImagemAnexo> buscarFotoPerfil(Integer usuarioId) {
        return imagemAnexoRepository.findFirstByUsuarioIdAndTipoOrderByDataUploadDesc(usuarioId, TIPO_PERFIL);
    }

    public Optional<ImagemAnexo> buscarImagemPrincipalProduto(Integer produtoId) {
        return imagemAnexoRepository.findFirstByProduto_IdProdutoAndTipoOrderByDataUploadDesc(produtoId, TIPO_PRODUTO);
    }

    public List<ImagemAnexo> listarImagensProduto(Integer produtoId) {
        return imagemAnexoRepository.findByProduto_IdProdutoAndTipoOrderByDataUploadDesc(produtoId, TIPO_PRODUTO);
    }

    public Optional<ImagemAnexo> buscarImagemProdutoPorId(Integer produtoId, Integer imagemId) {
        return imagemAnexoRepository.findByIdAndProduto_IdProduto(imagemId, produtoId);
    }

    @Transactional
    public void excluirImagemProduto(Integer produtoId, Integer imagemId) {
        ImagemAnexo imagem = imagemAnexoRepository.findByIdAndProduto_IdProduto(imagemId, produtoId)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        imagemAnexoRepository.delete(imagem);
    }

    private ImagemAnexo criarImagem(MultipartFile imagem) {
        try {
            ImagemAnexo imagemAnexo = new ImagemAnexo();
            imagemAnexo.setNomeArquivo(sanitizarNomeArquivo(imagem.getOriginalFilename()));
            imagemAnexo.setContentType(normalizarContentType(imagem));
            imagemAnexo.setTamanhoBytes(imagem.getSize());
            imagemAnexo.setDados(imagem.getBytes());
            return imagemAnexo;
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível ler a imagem enviada");
        }
    }

    private void validarArquivo(MultipartFile imagem, String contexto) {
        if (imagem == null || imagem.isEmpty()) {
            throw new RuntimeException("Envie uma imagem válida para o " + contexto);
        }

        if (imagem.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("Cada imagem deve ter no máximo 2 MB");
        }

        String contentType = imagem.getContentType() != null ? imagem.getContentType().toLowerCase() : "";
        String extensao = extrairExtensao(imagem.getOriginalFilename());

        boolean mimePermitido = MIME_TYPES_PERMITIDOS.contains(contentType);
        boolean extensaoPermitida = EXTENSOES_PERMITIDAS.contains(extensao);

        if (!mimePermitido && !extensaoPermitida) {
            throw new RuntimeException("Formato de imagem inválido. Use JPG, JPEG, WebP ou AVIF.");
        }
    }

    private String normalizarContentType(MultipartFile imagem) {
        String contentType = imagem.getContentType();
        if (contentType != null && !contentType.trim().isEmpty()) {
            return contentType;
        }

        String extensao = extrairExtensao(imagem.getOriginalFilename());
        return switch (extensao) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "webp" -> "image/webp";
            case "avif" -> "image/avif";
            default -> "application/octet-stream";
        };
    }

    private String sanitizarNomeArquivo(String nomeOriginal) {
        if (nomeOriginal == null || nomeOriginal.trim().isEmpty()) {
            return "imagem";
        }

        return nomeOriginal.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private String extrairExtensao(String nomeArquivo) {
        if (nomeArquivo == null || nomeArquivo.isBlank() || !nomeArquivo.contains(".")) {
            return "";
        }

        return nomeArquivo.substring(nomeArquivo.lastIndexOf('.') + 1).toLowerCase();
    }
}