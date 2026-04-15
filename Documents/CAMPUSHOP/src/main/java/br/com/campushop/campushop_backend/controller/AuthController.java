package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.AuthResponse;
import br.com.campushop.campushop_backend.dto.LoginRequest;
import br.com.campushop.campushop_backend.dto.RegisterRequest;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.security.JwtTokenProvider;
import br.com.campushop.campushop_backend.service.CustomUserDetailsService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UsuarioService usuarioService,
            CustomUserDetailsService customUserDetailsService,
            JwtTokenProvider jwtTokenProvider) {
        this.usuarioService = usuarioService;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getNomeCompleto() == null || request.getNomeCompleto().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Nome completo é obrigatório"));
            }

            if (request.getRa() == null || request.getRa().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "R.A é obrigatório"));
            }

            String ra = request.getRa().trim();
            if (!ra.matches("\\d{9}")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "R.A deve conter exatamente 9 dígitos numéricos"));
            }

            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email é obrigatório"));
            }

            String email = request.getEmail().trim().toLowerCase();
            if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email inválido"));
            }

            if (request.getSenha() == null || request.getSenha().length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "A senha deve ter pelo menos 6 caracteres"));
            }

            String confirmarSenha = request.getConfirmarSenha();
            if (confirmarSenha == null || confirmarSenha.trim().isEmpty()) {
                confirmarSenha = request.getSenha();
            }

            if (!request.getSenha().equals(confirmarSenha)) {
                return ResponseEntity.badRequest().body(Map.of("message", "As senhas não coincidem"));
            }

            if (usuarioService.emailJaCadastrado(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email já cadastrado"));
            }

            if (usuarioService.raJaCadastrado(ra)) {
                return ResponseEntity.badRequest().body(Map.of("message", "R.A já cadastrado"));
            }

            Usuario novoUsuario = new Usuario();
            novoUsuario.setNomeCompleto(request.getNomeCompleto().trim());
            novoUsuario.setNomeCliente(request.getNomeCompleto().trim());
            novoUsuario.setAtivado(true);
            novoUsuario.setDataCadastro(java.time.LocalDate.now());
            novoUsuario.setRa(ra);
            novoUsuario.setEmail(email);
            novoUsuario.setSenha(request.getSenha());
            novoUsuario
                    .setInstituicaoEnsino(request.getInstituicao() != null && !request.getInstituicao().trim().isEmpty()
                            ? request.getInstituicao().trim()
                            : "Não informado");
            novoUsuario.setCidade(request.getCidade() != null && !request.getCidade().trim().isEmpty()
                    ? request.getCidade().trim()
                    : "Não informado");
            novoUsuario.setTipoConta("comprador");

            Usuario salvo = usuarioService.salvar(novoUsuario);
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(salvo.getEmail());
            String token = jwtTokenProvider.generateToken(userDetails);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new AuthResponse(token, toUserMap(salvo)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (email.isEmpty() || request.getSenha() == null || request.getSenha().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Preencha email e senha"));
        }

        boolean usuarioExiste = usuarioService.buscarPorEmail(email).isPresent();
        if (!usuarioExiste) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuário não encontrado"));
        }

        boolean autenticado = usuarioService.autenticar(email, request.getSenha());
        if (!autenticado) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Senha incorreta"));
        }

        Usuario usuario = usuarioService.buscarPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(usuario.getEmail());
        String token = jwtTokenProvider.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token, toUserMap(usuario)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado"));
        }

        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                .orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Não autenticado"));
        }

        return ResponseEntity.ok(toUserMap(usuario));
    }

    private Map<String, Object> toUserMap(Usuario usuario) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", usuario.getId());
        user.put("nome", usuario.getNomeCompleto());
        user.put("email", usuario.getEmail());
        user.put("ra", usuario.getRa());
        user.put("role", "comprador");
        return user;
    }
}
