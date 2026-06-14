package br.com.campushop.campushop_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 🔐 Configuração de cache para rate limiting
 * Usa um mapa em memória para armazenar contadores de requisições por IP
 */
@Configuration
public class Bucket4jConfig {

    /**
     * Cria um bean de cache para rate limiting
     * Em produção, considere usar Redis para escala horizontal
     */
    @Bean
    public RateLimitCache rateLimitCache() {
        return new RateLimitCache();
    }

}
