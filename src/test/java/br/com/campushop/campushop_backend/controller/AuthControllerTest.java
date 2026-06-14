package br.com.campushop.campushop_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.campushop.campushop_backend.dto.CadastroRequestDTO;
import br.com.campushop.campushop_backend.dto.LoginRequest;
import br.com.campushop.campushop_backend.service.UsuarioService;
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

/**
 * Testes de integração para AuthController
 * Testa requisições HTTP reais contra a API
 * 
 * @SpringBootTest inicia todo o contexto Spring
 *                 @ActiveProfiles("test") usa application-test.properties
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private CadastroRequestDTO dtoValido;
    private LoginRequest loginValido;

    @BeforeEach
    void setUp() {
        // Setup: Prepara dados de teste reutilizáveis
        dtoValido = new CadastroRequestDTO();
        dtoValido.setNomeCompleto("João Silva");
        dtoValido.setEmail("joao@university.edu");
        dtoValido.setRa("123456789");
        dtoValido.setSenha("Senha@123456");
        dtoValido.setConfirmacaoSenha("Senha@123456");
        dtoValido.setInstituicao("USP");
        dtoValido.setCidade("São Paulo");

        loginValido = new LoginRequest();
        loginValido.setEmail("joao@university.edu");
        loginValido.setSenha("Senha@123456");
    }

    @Test
    @DisplayName("Deve retornar 400 quando email está vazio no cadastro")
    void cadastrar_emailVazio_retorna400() throws Exception {
        dtoValido.setEmail(""); // Email inválido

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoValido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validação falhou"));
    }

    @Test
    @DisplayName("Deve retornar 400 quando email tem formato inválido")
    void cadastrar_emailInvalido_retorna400() throws Exception {
        dtoValido.setEmail("email_sem_arroba"); // Sem @

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoValido)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando senha é muito fraca")
    void cadastrar_senhaFraca_retorna400() throws Exception {
        dtoValido.setSenha("123"); // Muito fraca
        dtoValido.setConfirmacaoSenha("123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoValido)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando RA tem formato inválido")
    void cadastrar_raInvalido_retorna400() throws Exception {
        dtoValido.setRa("ABC"); // Deve ser números

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtoValido)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 200 ao listar produtos (sem autenticação)")
    void listarProdutos_publico_retorna200() throws Exception {
        mockMvc.perform(get("/api/produtos")
                .param("page", "0")
                .param("size", "12")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 401 quando credenciais estão incorretas")
    void login_credenciaisErradas_retorna401() throws Exception {
        LoginRequest loginErrado = new LoginRequest();
        loginErrado.setEmail("naoexiste@university.edu");
        loginErrado.setSenha("senhaerrada");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginErrado)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve retornar erro quando senhas não conferem no reset")
    void resetSenha_senhasNaoConferem_retornaErro() throws Exception {
        String jsonRequest = """
                {
                    "token": "token_invalido",
                    "novaSenha": "NovaSenha@123",
                    "confirmacaoSenha": "OutraSenha@123"
                }
                """;

        mockMvc.perform(post("/api/auth/resetar-senha")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isBadRequest());
    }
}
