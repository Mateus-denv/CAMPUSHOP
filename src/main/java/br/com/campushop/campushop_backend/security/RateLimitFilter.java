package br.com.campushop.campushop_backend.security;

import br.com.campushop.campushop_backend.config.RateLimitCache;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 🔐 Filtro de Rate Limiting para proteger a API
 * Limita quantas requisições um IP pode fazer por minuto
 * 
 * Endpoints especiais:
 * - /api/auth/login: 5 tentativas por minuto (brute force protection)
 * - /api/auth/register: 5 tentativas por minuto (spam protection)
 * - Outros: 100 requisições por minuto
 */
@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.rate-limit.enabled", havingValue = "true", matchIfMissing = false)
public class RateLimitFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    // Limites por tipo de endpoint
    private static final int LIMITE_LOGIN_REGISTER = 5; // 5 req/min para login e register
    private static final int LIMITE_NORMAL = 100; // 100 req/min para outros endpoints

    private final RateLimitCache rateLimitCache;

    public RateLimitFilter(RateLimitCache rateLimitCache) {
        this.rateLimitCache = rateLimitCache;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Pega o IP do cliente (considera proxy reverso)
        String clientIP = getClientIP(httpRequest);

        // Verifica se é endpoint sensível (login/register)
        String path = httpRequest.getRequestURI();
        boolean isLoginOrRegister = path.contains("/api/auth/login") || path.contains("/api/auth/register");

        // Define limite baseado no tipo de requisição
        int limite = isLoginOrRegister ? LIMITE_LOGIN_REGISTER : LIMITE_NORMAL;

        // Incrementa contador para este IP
        int contador = rateLimitCache.incrementAndGet(clientIP);

        logger.debug("IP: {} | Requisição em {}: {}/{}", clientIP, path, contador, limite);

        if (contador <= limite) {
            // Dentro do limite - requisição permitida
            chain.doFilter(request, response);
        } else {
            // Limite excedido
            logger.warn("Rate limit excedido para IP: {} ({}/ requisições)", clientIP, contador);

            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("""
                    {
                        "status": 429,
                        "error": "Muitas requisições",
                        "message": "Você atingiu o limite de requisições. Aguarde um minuto antes de tentar novamente."
                    }
                    """);
        }
    }

    /**
     * Extrai IP do cliente considerando proxies reversos (X-Forwarded-For)
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            // Pega o primeiro IP se houver múltiplos separados por vírgula
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
