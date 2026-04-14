package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.AuthResponse;
import br.com.campushop.campushop_backend.dto.LoginRequest;
import br.com.campushop.campushop_backend.dto.RegisterRequest;import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.security.JwtTokenProvider;
import br.com.campushop.campushop_backend.service.CustomUserDetailsService;
import br.com.campushop.campushop_backend.service.UsuarioService;
import jakarta.validation.Valid;

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
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String ra = request.getRa().trim();

        if (usuarioService.emailJaCadastrado(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email já cadastrado"));
        }

        if (usuarioService.raJaCadastrado(ra)) {
            return ResponseEntity.badRequest().body(Map.of("message", "R.A já cadastrado"));
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNomeCompleto(request.getNomeCompleto().trim());
        novoUsuario.setRa(ra);
        novoUsuario.setEmail(email);
        novoUsuario.setSenha(request.getSenha());

        Usuario salvo = usuarioService.salvar(novoUsuario);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(salvo.getEmail());
        String token = jwtTokenProvider.generateToken(userDetails);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, toUserMap(salvo)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        boolean autenticado = usuarioService.autenticar(email, request.getSenha());
        if (!autenticado) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciais inválidas"));
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
        user.put("role", usuario.getTipoConta());
        return user;
    }
}
