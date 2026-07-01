package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.AuthResponse;
import br.com.campushop.campushop_backend.dto.LoginRequest;
import br.com.campushop.campushop_backend.dto.PasswordResetRequest;
import br.com.campushop.campushop_backend.dto.RedefinirSenhaRequest;
import br.com.campushop.campushop_backend.dto.RegisterRequest;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.security.JwtTokenProvider;
import br.com.campushop.campushop_backend.service.CustomUserDetailsService;
import br.com.campushop.campushop_backend.service.PasswordResetService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UsuarioService usuarioService;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordResetService passwordResetService;

    public AuthController(UsuarioService usuarioService,
            CustomUserDetailsService customUserDetailsService,
            JwtTokenProvider jwtTokenProvider,
            PasswordResetService passwordResetService) {
        this.usuarioService = usuarioService;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
        try {
            logger.info("Tentando registrar usuário: {}", request.getEmail());

            String email = request.getEmail().trim().toLowerCase();
            String ra = request.getRa().trim();

            if (usuarioService.emailJaCadastrado(email)) {
                logger.warn("Email já cadastrado: {}", email);
                return ResponseEntity.badRequest().body(Map.of("message", "Email já cadastrado"));
            }

            if (usuarioService.raJaCadastrado(ra)) {
                logger.warn("RA já cadastrado: {}", ra);
                return ResponseEntity.badRequest().body(Map.of("message", "R.A já cadastrado"));
            }

            Usuario novoUsuario = new Usuario();
            novoUsuario.setNomeCompleto(request.getNomeCompleto().trim());
            novoUsuario.setRa(ra);
            novoUsuario.setEmail(email);
            novoUsuario.setSenha(request.getSenha());
            novoUsuario.setCpfCnpj(request.getCpfCnpj());
            novoUsuario.setDataNascimento(request.getDataNascimento());
            novoUsuario.setInstituicaoEnsino(request.getInstituicao());
            novoUsuario.setCidade(request.getCidade());
            novoUsuario.setTipoConta(request.getPerfil());
            novoUsuario.setNomeCliente(request.getNomeCompleto().trim());
            novoUsuario.setAtivado(true);
            novoUsuario.setDataCadastro(java.time.LocalDate.now());
            novoUsuario.setSaldoVendas(BigDecimal.ZERO);

            Usuario salvo = usuarioService.salvar(novoUsuario);
            logger.info("Usuário registrado com sucesso: {} (ID: {})", email, salvo.getId());

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(salvo.getEmail());
            String token = jwtTokenProvider.generateToken(userDetails);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(token, toUserMap(salvo)));
        } catch (Exception e) {
            logger.error("Erro ao registrar usuário", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro ao criar conta: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String senha = request.getSenha();

        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email é obrigatório"));
        }
        if (senha == null || senha.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Senha é obrigatória"));
        }

        var usuarioOpt = usuarioService.buscarPorEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuário não existe"));
        }

        if (!usuarioService.autenticar(email, senha)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Senha incorreta"));
        }

        Usuario usuario = usuarioOpt.get();
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(usuario.getEmail());
        String token = jwtTokenProvider.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token, toUserMap(usuario)));
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> esqueciSenha(@RequestBody PasswordResetRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email é obrigatório"));
        }

        passwordResetService.solicitarRedefinicao(request.getEmail());
        return ResponseEntity
                .ok(Map.of("message", "Se existir uma conta com esse e-mail, enviaremos um link para redefinição."));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody RedefinirSenhaRequest request) {
        if (request == null || request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token é obrigatório"));
        }
        if (request.getNovaSenha() == null || request.getNovaSenha().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "A senha deve ter no mínimo 8 caracteres"));
        }

        try {
            passwordResetService.redefinirSenha(request.getToken(), request.getNovaSenha());
            return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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
        user.put("nomeCompleto", usuario.getNomeCompleto());
        user.put("nome", usuario.getNomeCompleto());
        user.put("email", usuario.getEmail());
        user.put("ra", usuario.getRa());
        user.put("role", usuario.getTipoConta());
        return user;
    }
}
