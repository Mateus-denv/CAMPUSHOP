package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.PasswordResetToken;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.PasswordResetTokenRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

    @InjectMocks
    private PasswordResetService passwordResetService;

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
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        passwordResetService.redefinirSenha("token-valido", "novaSenha123");

        assertEquals("senhaCriptografada", usuario.getSenha());
        verify(usuarioRepository).save(usuario);
        verify(passwordResetTokenRepository).delete(token);
    }
}
