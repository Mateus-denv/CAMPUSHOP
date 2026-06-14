package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.CadastroRequestDTO;
import br.com.campushop.campushop_backend.dto.LoginRequest;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.model.VerificationToken;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import br.com.campushop.campushop_backend.repository.VerificationTokenRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthTokenTypeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        tokenRepository.deleteAll();
        usuarioRepository.deleteAll();

        // Cria um usuário mínimo para associar com o token
        Usuario u = new Usuario();
        u.setNomeCompleto("João Silva");
        u.setRa("123456789");
        u.setEmail("token-type-test@university.edu");
        u.setNomeCliente("João Silva");
        u.setSenha("irrelevante");
        u.setInstituicaoEnsino("USP");
        u.setCidade("São Paulo");
        u.setTipoConta("ALUNO");
        u.setCpfCnpj("00000000000");
        u.setAtivado(true);
        u.setSaldoVendas(java.math.BigDecimal.ZERO);
        u.setDataCadastro(java.time.LocalDate.now());
        this.usuario = usuarioRepository.save(u);
    }

    @Test
    @DisplayName("Não deve aceitar token PASSWORD_RESET em /verificar-email")
    void resetTokenNaoPodeVerificarEmail() throws Exception {
        VerificationToken resetToken = new VerificationToken(
                "reset-token-1",
                usuario,
                VerificationToken.TokenType.PASSWORD_RESET,
                30);
        tokenRepository.save(resetToken);

        mockMvc.perform(get("/api/auth/verificar-email")
                .param("token", "reset-token-1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Não deve aceitar token EMAIL_VERIFICATION em /resetar-senha")
    void verificationTokenNaoPodeResetarSenha() throws Exception {
        VerificationToken emailToken = new VerificationToken(
                "email-token-1",
                usuario,
                VerificationToken.TokenType.EMAIL_VERIFICATION,
                30);
        tokenRepository.save(emailToken);

        String payload = "{" +
                "\"token\":\"email-token-1\"," +
                "\"novaSenha\":\"NovaSenha@123\"," +
                "\"confirmacaoSenha\":\"NovaSenha@123\"" +
                "}";

        mockMvc.perform(post("/api/auth/resetar-senha")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isNotFound());
    }
}
