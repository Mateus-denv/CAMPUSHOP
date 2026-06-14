package br.com.campushop.campushop_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade que armazena tokens de verificação de email e reset de senha
 * Cada token é único e tem data de expiração.
 *
 * <p>
 * IMPORTANTE: agora o token possui "type" para evitar que um token de um
 * fluxo seja aceito no outro.
 * </p>
 */
@Entity
@Table(name = "verification_tokens")
public class VerificationToken {

    public enum TokenType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TokenType type;

    @Column(nullable = false)
    private boolean verified = false;

    // Construtores
    public VerificationToken() {
    }

    /**
     * Cria um novo token com expiração definida em minutos
     */
    public VerificationToken(String token, Usuario usuario, TokenType type, int minutosExpiracao) {
        this.token = token;
        this.usuario = usuario;
        this.type = type;
        this.expiryDate = LocalDateTime.now().plusMinutes(minutosExpiracao);
        this.verified = false;
    }

    /**
     * @deprecated Use o construtor com TokenType para evitar aceitação cruzada.
     */
    @Deprecated
    public VerificationToken(String token, Usuario usuario, int minutosExpiracao) {
        this(token, usuario, TokenType.EMAIL_VERIFICATION, minutosExpiracao);
    }

    /**
     * Verifica se o token expirou
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public TokenType getType() {
        return type;
    }

    public void setType(TokenType type) {
        this.type = type;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }
}
