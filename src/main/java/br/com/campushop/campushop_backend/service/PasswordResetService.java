package br.com.campushop.campushop_backend.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.campushop.campushop_backend.model.PasswordResetToken;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PasswordResetTokenRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int EXPIRACAO_MINUTOS = 30;

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(PasswordResetTokenRepository passwordResetTokenRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void solicitarRedefinicao(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email.trim().toLowerCase());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Tentativa de redefinição para e-mail inexistente: {}", email);
            return;
        }

        Usuario usuario = usuarioOpt.get();
        passwordResetTokenRepository.deleteByUsuario(usuario);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUsuario(usuario);
        resetToken.setExpiration(LocalDateTime.now().plusMinutes(EXPIRACAO_MINUTOS));

        passwordResetTokenRepository.save(resetToken);
        emailService.enviarEmailRedefinicaoSenha(usuario.getEmail(), token);
        logger.info("Token de redefinição criado para o usuário {}", usuario.getEmail());
    }

    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido"));

        if (resetToken.getExpiration().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
        passwordResetTokenRepository.delete(resetToken);
        logger.info("Senha redefinida com sucesso para o usuário {}", usuario.getEmail());
    }

    public Optional<PasswordResetToken> buscarPorToken(String token) {
        return passwordResetTokenRepository.findByToken(token);
    }
}
