package br.com.campushop.campushop_backend.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import br.com.campushop.campushop_backend.dto.ProdutoProximoResponse;
import br.com.campushop.campushop_backend.model.Produto;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;

@Service
public class GeolocalizacaoService {

        private static final double RAIO_TERRA_KM = 6371.0;

        private final ProdutoRepository produtoRepository;

        public GeolocalizacaoService(ProdutoRepository produtoRepository) {
                this.produtoRepository = produtoRepository;
        }

        /**
         * Calcula a distância entre dois pontos geográficos usando a fórmula de
         * Haversine.
         */
        public double calcularDistanciaKm(double origemLatitude, double origemLongitude, double destinoLatitude,
                        double destinoLongitude) {

                double deltaLatitude = Math.toRadians(destinoLatitude - origemLatitude);
                double deltaLongitude = Math.toRadians(destinoLongitude - origemLongitude);

                double latOrigemRad = Math.toRadians(origemLatitude);
                double latDestinoRad = Math.toRadians(destinoLatitude);

                double haversine = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2)
                                + Math.cos(latOrigemRad) * Math.cos(latDestinoRad)
                                                * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);

                double distancia = 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(haversine));
                return Math.round(distancia * 10d) / 10d;
        }

        /**
         * Busca produtos de vendedores próximos ao ponto informado e ordena por
         * distância.
         */
        public List<ProdutoProximoResponse> buscarProdutosProximos(double latitude, double longitude, double raioKm,
                        Integer categoriaId, String nome, Integer produtoId) {
                return produtoRepository.findAll().stream()
                                .filter(this::produtoPossuiLocalizacao)
                                .filter(produto -> produtoId == null || produto.getIdProduto().equals(produtoId))
                                .filter(produto -> filtrarPorNome(produto, nome))
                                .filter(produto -> filtrarPorCategoria(produto, categoriaId))
                                .map(produto -> buildProdutoDistancia(produto, latitude, longitude))
                                .filter(produtoDistancia -> produtoDistancia.distanciaKm <= raioKm)
                                .sorted(Comparator.comparingDouble(ProdutoDistancia::distanciaKm))
                                .map(this::mapToResponse)
                                .toList();
        }

        private boolean produtoPossuiLocalizacao(Produto produto) {
                return produto != null && produto.getUsuario() != null && produto.getUsuario().getLatitude() != null
                                && produto.getUsuario().getLongitude() != null;
        }

        private boolean filtrarPorNome(Produto produto, String nome) {
                if (nome == null || nome.isBlank()) {
                        return true;
                }
                // Usa o nome do produto, que é o campo correto no modelo Produto.
                return produto.getNomeProduto() != null
                                && produto.getNomeProduto().toLowerCase(Locale.ROOT)
                                                .contains(nome.toLowerCase(Locale.ROOT));
        }

        private boolean filtrarPorCategoria(Produto produto, Integer categoriaId) {
                if (categoriaId == null) {
                        return true;
                }
                return produto.getCategoria() != null && produto.getCategoria().getIdCategoria() != null
                                && produto.getCategoria().getIdCategoria().equals(categoriaId);
        }

        private ProdutoDistancia buildProdutoDistancia(Produto produto, double latitude, double longitude) {
                double distanciaKm = calcularDistanciaKm(latitude, longitude, produto.getUsuario().getLatitude(),
                                produto.getUsuario().getLongitude());
                return new ProdutoDistancia(produto, distanciaKm);
        }

        private ProdutoProximoResponse mapToResponse(ProdutoDistancia produtoDistancia) {
                Produto produto = produtoDistancia.produto();
                ProdutoProximoResponse response = new ProdutoProximoResponse();
                response.setIdProduto(produto.getIdProduto());
                response.setNome(produto.getNomeProduto());
                response.setDescricao(produto.getDescricao());
                response.setPreco(produto.getPreco());
                response.setCategoriaNome(
                                produto.getCategoria() != null ? produto.getCategoria().getNome_categoria() : null);
                response.setCidadeVendedor(produto.getUsuario().getCidade());
                response.setEstadoVendedor(produto.getUsuario().getEstado());
                response.setDistanciaKm(produtoDistancia.distanciaKm());
                return response;
        }

        private record ProdutoDistancia(Produto produto, double distanciaKm) {
        }
}