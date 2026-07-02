package br.com.campushop.campushop_backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.campushop.campushop_backend.model.PasswordResetToken;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PasswordResetTokenRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        passwordResetService = new PasswordResetService(
                passwordResetTokenRepository,
                usuarioRepository,
                passwordEncoder,
                emailService);
    }

    @Test
    void shouldResetPasswordWhenTokenIsValid() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setSenha("senhaAntiga");

        PasswordResetToken token = new PasswordResetToken();
        token.setToken("token-valido");
        token.setUsuario(usuario);
        token.setExpiration(LocalDateTime.now().plusMinutes(10));

        when(passwordResetTokenRepository.findByToken("token-valido")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("novaSenha123")).thenReturn("senhaCriptografada");
        when(usuarioRepository.save(ArgumentMatchers.any(Usuario.class)))
                .thenAnswer(invocation -> invocation.<Usuario>getArgument(0));

        passwordResetService.redefinirSenha("token-valido", "novaSenha123");

        assertEquals("senhaCriptografada", usuario.getSenha());
        verify(usuarioRepository).save(usuario);
        verify(passwordResetTokenRepository).delete(token);
    }

    @Test
    void shouldCreateTokenAndHandleMailFailureGracefully() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setEmail("teste@example.com");

        when(usuarioRepository.findByEmail(ArgumentMatchers.anyString())).thenReturn(Optional.of(usuario));
        MailException mailException = new MailException("SMTP falha") {
        };
        doThrow(mailException)
                .when(emailService)
                .enviarEmailRedefinicaoSenha(ArgumentMatchers.anyString(), ArgumentMatchers.anyString());

        passwordResetService.solicitarRedefinicao("teste@example.com");

        verify(passwordResetTokenRepository).save(ArgumentMatchers.<PasswordResetToken>any());
        verify(emailService).enviarEmailRedefinicaoSenha(ArgumentMatchers.eq("teste@example.com"),
                ArgumentMatchers.anyString());
    }
}
