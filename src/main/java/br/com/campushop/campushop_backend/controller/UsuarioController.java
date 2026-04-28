package br.com.campushop.campushop_backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.campushop.campushop_backend.dto.AuthResponse;
import br.com.campushop.campushop_backend.dto.UpdateProfileRequest;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.security.JwtTokenProvider;
import br.com.campushop.campushop_backend.service.CustomUserDetailsService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios") // Define a rota base para operações relacionadas a usuários, como atualização de perfil e exclusão de conta.
public class UsuarioController {
    // Injeção de dependência para o serviço de usuário, necessário para operações de perfil e exclusão de conta.
    @Autowired
    private UsuarioService usuarioService;

    private final CustomUserDetailsService customUserDetailsService; // Injeção de dependência para carregar detalhes do usuário, necessário para reemissão de token após atualização de perfil.
    private final JwtTokenProvider jwtTokenProvider; // Injeção de dependência para geração de token JWT, necessário para reemissão de token após atualização de perfil.

    // Construtor para injeção de dependências necessárias para operações de perfil e token.
    public UsuarioController(CustomUserDetailsService customUserDetailsService, JwtTokenProvider jwtTokenProvider) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // Retorna os dados do usuário autenticado, incluindo status de vendedor.
    @GetMapping("/me")
    public ResponseEntity<?> obterPerfil(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado"));
        }
        return usuarioService.buscarPorEmail(authentication.getName())
                .map(u -> ResponseEntity.ok((Object) toUserMap(u)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado")));
    }

    // Ativa o modo vendedor para o usuário autenticado.
    // Qualquer usuário pode solicitar; validação extra pode ser adicionada aqui no futuro.
    @PostMapping("/me/ativar-vendedor")
    public ResponseEntity<?> ativarVendedor(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado"));
        }

        try {
            Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            usuarioService.ativarVendedor(usuario.getId());
            // Recarrega o usuário para retornar os dados atualizados com vendedorAtivo=true.
            Usuario atualizado = usuarioService.buscarPorEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            return ResponseEntity.ok(toUserMap(atualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Endpoint para atualização de perfil do usuário autenticado, garantindo que
    // apenas usuários autenticados possam atualizar seus dados sensíveis.
    @PutMapping("/me/perfil")
    public ResponseEntity<?> atualizarPerfil(@RequestBody @Valid UpdateProfileRequest request,
            Authentication authentication) {
        // Garante autenticação válida antes de atualizar dados sensíveis de conta.
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado"));  // Retorna mensagem de erro detalhada para o frontend em caso de falta de autenticação.
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

            return ResponseEntity.ok(new AuthResponse(token, toUserMap(atualizado))); // Retorna token atualizado e dados do usuário para o frontend após atualização de perfil bem-sucedida.
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); // Retorna mensagem de erro detalhada para o frontend em caso de falha na atualização de perfil, como validação ou regras de negócio.
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable Integer id) {  // Endpoint para exclusão de conta do usuário autenticado, garantindo que apenas usuários autenticados possam excluir suas contas. O ID do usuário a ser excluído é passado como parâmetro na URL.
        try {
            usuarioService.excluirUsuario(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Map<String, Object> toUserMap(Usuario usuario) {
        // Mantém o mesmo contrato de payload usado no login para simplificar o frontend.
        Map<String, Object> user = new HashMap<>();
        user.put("id", usuario.getId());
        user.put("nomeCompleto", usuario.getNomeCompleto());
        user.put("nome", usuario.getNomeCompleto());
        user.put("email", usuario.getEmail());
        user.put("ra", usuario.getRa());
        user.put("role", usuario.getTipoConta());
        // Expõe o status de vendedor para o frontend controlar acesso ao modo venda.
        user.put("vendedorAtivo", usuario.getVendedorAtivo());
        return user;
    }
}