package br.com.campushop.campushop_backend.config;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 🔐 Cache simples em memória para armazenar contadores de rate limit por IP
 * Armazena: IP -> (count, timestamp)
 */
public class RateLimitCache {

    // Estrutura: IP -> [contador, timestamp_da_ultima_requisicao]
    private final Map<String, long[]> cache = new ConcurrentHashMap<>();

    // Janela de tempo: 1 minuto em milissegundos
    private static final long TIME_WINDOW_MS = 60 * 1000;

    /**
     * Incrementa o contador de requisições para um IP
     * Retorna o novo contador após incrementar
     */
    public int incrementAndGet(String ip) {
        long now = System.currentTimeMillis();

        cache.compute(ip, (key, value) -> {
            if (value == null) {
                // Primeira requisição: cria novo contador
                return new long[] { 1, now };
            }

            long lastRequestTime = value[1];
            long timeDiff = now - lastRequestTime;

            if (timeDiff > TIME_WINDOW_MS) {
                // Passou a janela de tempo, reseta o contador
                return new long[] { 1, now };
            } else {
                // Ainda dentro da janela, incrementa
                value[0]++;
                value[1] = now;
                return value;
            }
        });

        return (int) cache.get(ip)[0];
    }

    /**
     * Retorna o contador atual de requisições para um IP
     */
    public int getCount(String ip) {
        long[] value = cache.get(ip);
        if (value == null) {
            return 0;
        }

        long now = System.currentTimeMillis();
        long timeDiff = now - value[1];

        // Se passou a janela de tempo, retorna 0
        if (timeDiff > TIME_WINDOW_MS) {
            return 0;
        }

        return (int) value[0];
    }

    /**
     * Limpa entradas antigas (maior que 5 minutos sem requisições)
     * Executado periodicamente para liberar memória
     */
    public void cleanup() {
        long now = System.currentTimeMillis();
        long maxAge = 5 * 60 * 1000; // 5 minutos

        cache.entrySet().removeIf(entry -> {
            long lastRequestTime = entry.getValue()[1];
            return (now - lastRequestTime) > maxAge;
        });
    }
}
