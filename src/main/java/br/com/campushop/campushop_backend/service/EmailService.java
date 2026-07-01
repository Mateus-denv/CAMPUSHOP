package br.com.campushop.campushop_backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmailRedefinicaoSenha(String emailDestino, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailDestino);
        message.setSubject("Redefinição de senha");
        message.setText("Olá,\n\n"
                + "Recebemos uma solicitação para redefinir sua senha.\n\n"
                + "Clique no link abaixo:\n\n"
                + "http://localhost:5173/redefinir-senha?token=" + token + "\n\n"
                + "Caso não tenha solicitado, ignore este e-mail.");

        mailSender.send(message);
    }
}
