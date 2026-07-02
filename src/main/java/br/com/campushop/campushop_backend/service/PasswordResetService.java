package br.com.campushop.campushop_backend.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
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
        logger.info("Usuário encontrado {}", usuario.getEmail());

        passwordResetTokenRepository.deleteByUsuario(usuario);
        logger.info("Tokens antigos excluídos para o usuário {}", usuario.getEmail());

        String token = UUID.randomUUID().toString();
        logger.info("Token gerado {}", token);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUsuario(usuario);
        resetToken.setExpiration(LocalDateTime.now().plusMinutes(EXPIRACAO_MINUTOS));

        logger.info("Salvando token de redefinição na base de dados");
        passwordResetTokenRepository.save(resetToken);
        logger.info("Token salvo com sucesso para {}", usuario.getEmail());

        logger.info("Chamando EmailService para enviar e-mail de redefinição");
        try {
            emailService.enviarEmailRedefinicaoSenha(usuario.getEmail(), token);
            logger.info("Email de redefinição enviado com sucesso para {}", usuario.getEmail());
        } catch (Exception e) {
            logger.error("Falha ao enviar e-mail de redefinição para {}", usuario.getEmail(), e);
            // Mantém a criação do token mesmo se o envio de email falhar.
        }

        logger.info("Fluxo de recuperação concluído para o usuário {}", usuario.getEmail());
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
