package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.AuthResponse;
import br.com.campushop.campushop_backend.dto.LoginRequest;
import br.com.campushop.campushop_backend.dto.RegisterRequest;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.security.JwtTokenProvider;
import br.com.campushop.campushop_backend.service.CustomUserDetailsService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

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

    public AuthController(UsuarioService usuarioService,
            CustomUserDetailsService customUserDetailsService,
            JwtTokenProvider jwtTokenProvider) {
        this.usuarioService = usuarioService;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
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
