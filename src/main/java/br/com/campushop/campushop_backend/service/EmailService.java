package br.com.campushop.campushop_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String smtpPassword;

    public EmailService(JavaMailSender mailSender,
            @Value("${spring.mail.from:${spring.mail.username:}}") String fromAddress,
            @Value("${spring.mail.password:}") String smtpPassword) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.smtpPassword = smtpPassword;
    }

    public void enviarEmailRedefinicaoSenha(String emailDestino, String token) {
        if (fromAddress == null || fromAddress.isBlank()) {
            logger.error(
                    "spring.mail.from ou spring.mail.username não está configurado, e não é possível enviar e-mail");
            throw new IllegalStateException("SMTP não configurado: defina spring.mail.username e spring.mail.password");
        }
        if (smtpPassword == null || smtpPassword.isBlank()) {
            logger.error("spring.mail.password não está configurado, e não é possível enviar e-mail");
            throw new IllegalStateException("SMTP não configurado: defina spring.mail.password");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(emailDestino);
        message.setSubject("Redefinição de senha");
        message.setText("""
                Olá,

                Recebemos uma solicitação para redefinir sua senha.

                Clique no link abaixo:

                http://localhost:5173/redefinir-senha?token=%s

                Caso não tenha solicitado, ignore este e-mail.
                """.formatted(token));

        logger.info("Preparando envio de e-mail para {}", emailDestino);
        logger.info("De: {} | Para: {}", fromAddress, emailDestino);
        logger.info("Mensagem: {}", message.getText());
        mailSender.send(message);
        logger.info("E-mail enviado com sucesso para {}", emailDestino);
    }
}
