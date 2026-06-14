package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.exceptions.ResourceNotFoundException;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import br.com.campushop.campushop_backend.validation.UsuarioValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para UsuarioService
 * Usa Mockito para simular dependências
 * 
 * @ExtendWith(MockitoExtension.class) injeta os mocks automaticamente
 */
@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UsuarioValidator usuarioValidator;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuarioValido;

    @BeforeEach
    void setUp() {
        // Setup: Cria um usuário de teste
        usuarioValido = new Usuario();
        usuarioValido.setId(1);
        usuarioValido.setNomeCompleto("João Silva");
        usuarioValido.setEmail("joao@university.edu");
        usuarioValido.setRa("123456789");
        usuarioValido.setSenha("hashedPassword123");
        usuarioValido.setAtivado(true);
        usuarioValido.setInstituicaoEnsino("USP");
        usuarioValido.setCidade("São Paulo");
    }

    @Test
    @DisplayName("Deve lançar exceção quando email já existe")
    void salvar_emailExistente_lancaExcecao() {
        // Arrange: Prepara
        when(usuarioRepository.existsByEmail(usuarioValido.getEmail())).thenReturn(true);

        // Act & Assert: Executa e verifica
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            usuarioService.salvar(usuarioValido);
        });

        assertTrue(exception.getMessage().contains("Email já cadastrado"));
        verify(usuarioRepository, never()).save(any()); // Verifica que save NÃO foi chamado
    }

    @Test
    @DisplayName("Deve lançar exceção quando RA já existe")
    void salvar_raExistente_lancaExcecao() {
        // Arrange
        when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
        when(usuarioRepository.existsByRa(usuarioValido.getRa())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            usuarioService.salvar(usuarioValido);
        });

        assertTrue(exception.getMessage().contains("RA já cadastrado"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve verificar se email já está cadastrado")
    void emailJaCadastrado_retornaTrue() {
        // Arrange
        when(usuarioRepository.existsByEmail(usuarioValido.getEmail())).thenReturn(true);

        // Act
        boolean resultado = usuarioService.emailJaCadastrado(usuarioValido.getEmail());

        // Assert
        assertTrue(resultado);
        verify(usuarioRepository, times(1)).existsByEmail(usuarioValido.getEmail());
    }

    @Test
    @DisplayName("Deve verificar se RA já está cadastrado")
    void raJaCadastrado_retornaTrue() {
        // Arrange
        when(usuarioRepository.existsByRa(usuarioValido.getRa())).thenReturn(true);

        // Act
        boolean resultado = usuarioService.raJaCadastrado(usuarioValido.getRa());

        // Assert
        assertTrue(resultado);
        verify(usuarioRepository).existsByRa(usuarioValido.getRa());
    }

    @Test
    @DisplayName("Deve autenticar usuário com credenciais corretas")
    void autenticar_senhaCorreta_retornaTrue() {
        // Arrange
        String emailTeste = "joao@university.edu";
        String senhaTeste = "senha123";
        usuarioValido.setSenha("$2b$10$hashedpassword");

        when(usuarioRepository.findByEmail(emailTeste))
                .thenReturn(Optional.of(usuarioValido));

        // O service usa passwordEncoder.matches apenas se a senha salva começar com
        // $2a$/$2b$/$2y$
        when(passwordEncoder.matches(eq(senhaTeste), eq("$2b$10$hashedpassword")))
                .thenReturn(true);

        // Act
        boolean resultado = usuarioService.autenticar(emailTeste, senhaTeste);

        // Assert
        assertTrue(resultado);
    }

    @Test
    @DisplayName("Deve retornar false quando usuário não existe")
    void autenticar_usuarioNaoExiste_retornaFalse() {
        // Arrange
        when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act
        boolean resultado = usuarioService.autenticar("inexistente@email.com", "qualquersenha");

        // Assert
        assertFalse(resultado);
    }

    @Test
    @DisplayName("Deve buscar usuário por email")
    void buscarPorEmail_usuarioExiste_retornaUsuario() {
        // Arrange
        when(usuarioRepository.findByEmail(usuarioValido.getEmail()))
                .thenReturn(Optional.of(usuarioValido));

        // Act
        Optional<Usuario> resultado = usuarioService.buscarPorEmail(usuarioValido.getEmail());

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals("João Silva", resultado.get().getNomeCompleto());
    }

    @Test
    @DisplayName("Deve retornar empty quando usuário não existe")
    void buscarPorEmail_usuarioNaoExiste_retornaEmpty() {
        // Arrange
        when(usuarioRepository.findByEmail("naoexiste@email.com"))
                .thenReturn(Optional.empty());

        // Act
        Optional<Usuario> resultado = usuarioService.buscarPorEmail("naoexiste@email.com");

        // Assert
        assertFalse(resultado.isPresent());
    }
}
