package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.exceptions.ResourceNotFoundException;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.model.VerificationToken;
import br.com.campushop.campushop_backend.repository.VerificationTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Serviço de email para CampuShop
 * Envia emails de verificação e recuperação de senha
 * 
 * IMPORTANTE: Configurar em application.properties:
 * - spring.mail.host
 * - spring.mail.port
 * - spring.mail.username
 * - spring.mail.password
 * - app.frontend.url
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Envia email de verificação de email (em background)
     * 
     * @Async faz com que o email seja enviado em thread separada
     */
    @Async
    public void enviarVerificacao(Usuario usuario) {
        try {
            // Gera um token único
            String token = UUID.randomUUID().toString();

            // Salva token no banco (válido por 24 horas)
            VerificationToken verificationToken = new VerificationToken(token, usuario,
                    VerificationToken.TokenType.EMAIL_VERIFICATION, 24 * 60);

            tokenRepository.save(verificationToken);

            // Constrói link de verificação
            String link = frontendUrl + "/verificar-email?token=" + token;

            // Prepara email
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(usuario.getEmail());
            email.setSubject("CampuShop - Confirme seu email 📧");
            email.setText("""
                    Olá, %s!

                    Bem-vindo ao CampuShop! 🎉

                    Para ativar sua conta, clique no link abaixo:
                    %s

                    Este link expira em 24 horas.

                    Se você não se cadastrou, ignore este email.

                    Equipe CampuShop
                    """.formatted(usuario.getNomeCompleto(), link));

            // Envia email de forma assíncrona
            mailSender.send(email);
            logger.info("Email de verificação enviado para: {}", usuario.getEmail());

        } catch (Exception e) {
            logger.error("Erro ao enviar email de verificação: {}", e.getMessage(), e);
            // Não relança exceção para não interromper o cadastro
        }
    }

    /**
     * Verifica um token de email
     * Se válido, marca como verificado
     */
    public boolean verificarEmail(String token) {
        logger.info("Tentando verificar email com token: {}", token.substring(0, 8) + "...");

        VerificationToken vt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token de verificação inválido"));

        if (vt.getType() != VerificationToken.TokenType.EMAIL_VERIFICATION) {
            throw new ResourceNotFoundException("Token de verificação inválido");
        }

        // Verifica se token expirou
        if (vt.isExpired()) {
            tokenRepository.delete(vt);
            throw new ResourceNotFoundException("Token de verificação expirado. Solicite um novo.");
        }

        // Marca como verificado
        vt.setVerified(true);
        vt.getUsuario().setAtivado(true); // Ativa a conta do usuário
        tokenRepository.save(vt);

        logger.info("Email verificado com sucesso para: {}", vt.getUsuario().getEmail());
        return true;
    }

    /**
     * Envia email de recuperação de senha
     */
    @Async
    public void enviarResetSenha(Usuario usuario) {
        try {
            // Gera um token único
            String token = UUID.randomUUID().toString();

            // Salva token no banco (válido por 30 minutos)
            VerificationToken resetToken = new VerificationToken(token, usuario,
                    VerificationToken.TokenType.PASSWORD_RESET, 30);

            tokenRepository.save(resetToken);

            // Constrói link para resetar senha
            String link = frontendUrl + "/resetar-senha?token=" + token;

            // Prepara email
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(usuario.getEmail());
            email.setSubject("CampuShop - Recuperação de senha 🔐");
            email.setText("""
                    Olá, %s!

                    Recebemos uma solicitação para redefinir sua senha.

                    Clique no link abaixo para criar uma nova senha:
                    %s

                    Este link expira em 30 minutos.

                    Se você não solicitou, ignore este email.

                    Equipe CampuShop
                    """.formatted(usuario.getNomeCompleto(), link));

            // Envia email de forma assíncrona
            mailSender.send(email);
            logger.info("Email de reset de senha enviado para: {}", usuario.getEmail());

        } catch (Exception e) {
            logger.error("Erro ao enviar email de reset: {}", e.getMessage(), e);
        }
    }
}
