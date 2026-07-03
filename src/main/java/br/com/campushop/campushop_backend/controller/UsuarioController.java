package br.com.campushop.campushop_backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.campushop.campushop_backend.dto.AuthResponse;
import br.com.campushop.campushop_backend.dto.LocalizacaoRequest;
import br.com.campushop.campushop_backend.dto.UpdateProfileRequest;
import br.com.campushop.campushop_backend.model.ImagemAnexo;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.security.JwtTokenProvider;
import br.com.campushop.campushop_backend.service.CustomUserDetailsService;
import br.com.campushop.campushop_backend.service.ImagemService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios") // Define a rota base para operações relacionadas a usuários, como atualização
                                 // de perfil e exclusão de conta.
public class UsuarioController {
    private final UsuarioService usuarioService;
    private final ImagemService imagemService;
    private final CustomUserDetailsService customUserDetailsService; // Injeção de dependência para carregar detalhes do
                                                                     // usuário, necessário para reemissão de token após
                                                                     // atualização de perfil.
    private final JwtTokenProvider jwtTokenProvider; // Injeção de dependência para geração de token JWT, necessário
                                                     // para reemissão de token após atualização de perfil.

    // Construtor para injeção de dependências necessárias para operações de perfil
    // e token.
    public UsuarioController(UsuarioService usuarioService, ImagemService imagemService,
            CustomUserDetailsService customUserDetailsService, JwtTokenProvider jwtTokenProvider) {
        this.usuarioService = usuarioService;
        this.imagemService = imagemService;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // Endpoint para atualização de perfil do usuário autenticado, garantindo que
    // apenas usuários autenticados possam atualizar seus dados sensíveis.
    @PutMapping("/me/perfil")
    public ResponseEntity<?> atualizarPerfil(@RequestBody @Valid UpdateProfileRequest request,
            Authentication authentication) {
        // Garante autenticação válida antes de atualizar dados sensíveis de conta.
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado")); // Retorna
                                                                                                              // mensagem
                                                                                                              // de erro
                                                                                                              // detalhada
                                                                                                              // para o
                                                                                                              // frontend
                                                                                                              // em caso
                                                                                                              // de
                                                                                                              // falta
                                                                                                              // de
                                                                                                              // autenticação.
        }

        try { // Tenta atualizar o perfil do usuário autenticado, capturando exceções de
              // validação ou regras de negócio.
            Usuario atualizado = usuarioService.atualizarPerfil(
                    authentication.getName(),
                    request.getNomeCompleto(),
                    request.getEmail());

            // Reemite token para manter sessão válida quando o email (subject do JWT) muda.
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(atualizado.getEmail());
            String token = jwtTokenProvider.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(token, toUserMap(atualizado))); // Retorna token atualizado e
                                                                                      // dados do usuário para o
                                                                                      // frontend após atualização de
                                                                                      // perfil bem-sucedida.
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); // Retorna mensagem de erro
                                                                                        // detalhada para o frontend em
                                                                                        // caso de falha na atualização
                                                                                        // de perfil, como validação ou
                                                                                        // regras de negócio.
        }
    }

    @PostMapping(value = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> atualizarFotoPerfil(@RequestPart("imagem") MultipartFile imagem,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado"));
        }

        try {
            Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            imagemService.salvarFotoPerfil(usuario, imagem);
            return ResponseEntity.ok(Map.of("message", "Foto de perfil atualizada com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obterFotoPerfil(@PathVariable Integer id) {
        return imagemService.buscarFotoPerfil(id)
                .map(this::buildImageResponse)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable Integer id) { // Endpoint para exclusão de conta do usuário
                                                                           // autenticado, garantindo que apenas
                                                                           // usuários autenticados possam excluir suas
                                                                           // contas. O ID do usuário a ser excluído é
                                                                           // passado como parâmetro na URL.
        try {
            usuarioService.excluirUsuario(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint para obter dados públicos de um usuário (vendedor) pelo ID.
    @org.springframework.web.bind.annotation.GetMapping("/{id}")
    public ResponseEntity<?> obterUsuarioPorId(@PathVariable Integer id) {
        try {
            var usuarioOpt = usuarioService.buscarPorId(id);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Usuario usuario = usuarioOpt.get();
            Map<String, Object> user = new HashMap<>();
            user.put("id", usuario.getId());
            user.put("nomeCompleto", usuario.getNomeCompleto());
            user.put("nome", usuario.getNomeCompleto());
            user.put("instituicao", usuario.getInstituicaoEnsino());
            user.put("cidade", usuario.getCidade());
            user.put("instituicaoEnsino", usuario.getInstituicaoEnsino());
            user.put("localidade", usuario.getCidade());

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro ao buscar usuário"));
        }
    }

    private Map<String, Object> toUserMap(Usuario usuario) {
        // Mantém o mesmo contrato de payload usado no login para simplificar o
        // frontend.
        Map<String, Object> user = new HashMap<>();
        user.put("id", usuario.getId());
        user.put("nomeCompleto", usuario.getNomeCompleto());
        user.put("nome", usuario.getNomeCompleto());
        user.put("email", usuario.getEmail());
        user.put("ra", usuario.getRa());
        user.put("role", usuario.getTipoConta());
        return user;
    }

    /**
     * Atualiza a localização do usuário autenticado.
     * Recebe latitude/longitude e campos opcionais de endereço.
     */
    @PutMapping("/localizacao")
    public ResponseEntity<?> atualizarLocalizacao(@RequestBody LocalizacaoRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado"));
        }

        try {
            usuarioService.atualizarLocalizacao(
                    authentication.getName(),
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getCidade(),
                    request.getEstado(),
                    request.getCep(),
                    request.getEndereco());

            return ResponseEntity.ok(Map.of("message", "Localização atualizada com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private ResponseEntity<byte[]> buildImageResponse(ImagemAnexo imagem) {
        String contentType = imagem.getContentType() != null ? imagem.getContentType() : "application/octet-stream";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(imagem.getDados());
    }
}