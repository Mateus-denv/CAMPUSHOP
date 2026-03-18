# ============================================
# CampuShop - Marketplace Estudantil
# Dockerfile Multi-Stage Build Otimizado
# ============================================

# ============================================
# Stage 1: BUILD - Compilar a aplicação
# ============================================
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Metadados da imagem
LABEL maintainer="CampuShop Team (Caio, Jhonathas, Julia, Pedro)"
LABEL description="CampuShop Backend - Marketplace Estudantil Spring Boot"
LABEL version="0.0.1-SNAPSHOT"
LABEL java.version="17"
LABEL spring.boot.version="3.1.5"

# Definir diretório de trabalho
WORKDIR /app

# ==== Otimização de Cache de Dependências ====
# Copiar apenas pom.xml primeiro para aproveitar cache do Docker
COPY pom.xml .

# Baixar todas as dependências (essa camada só é reconstruída se pom.xml mudar)
RUN mvn dependency:go-offline -B

# ==== Copiar Código Fonte ====
COPY src ./src

# ==== Compilar Aplicação ====
# -DskipTests: pula testes para build mais rápido
# -B: modo batch (sem output colorido)
# --no-transfer-progress: menos logs durante download
RUN mvn clean package -DskipTests -B --no-transfer-progress

# Verificar se o JAR foi criado (debug)
RUN echo "✅ Build concluído. Listando arquivos gerados:" && ls -lh /app/target/*.jar

# ============================================
# Stage 2: RUNTIME - Executar a aplicação
# ============================================
FROM eclipse-temurin:17-jre-jammy

# ==== Configurar Timezone ====
ENV TZ=America/Sao_Paulo

# ==== Setup completo em uma única camada (otimização) ====
RUN groupadd -r campushop && \
    useradd -r -g campushop -s /bin/false campushop && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    netcat-traditional \
    ca-certificates \
    tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    rm -rf /var/lib/apt/lists/* && \
    echo "✅ Ambiente configurado com sucesso"

# Definir diretório de trabalho
WORKDIR /app

# ==== Copiar JAR da Build Stage ====
COPY --from=build /app/target/*.jar app.jar

# ==== Criar Estrutura de Diretórios e Ajustar Permissões ====
RUN mkdir -p /app/logs /app/temp && \
    chown -R campushop:campushop /app && \
    chmod 755 /app

# ==== Mudar para Usuário Não-Root ====
USER campushop

# ==== Expor Porta ====
EXPOSE 8080

# ==== Variáveis de Ambiente ====
# Estas são sobrescritas pelo docker-compose.yml
ENV SPRING_PROFILES_ACTIVE=docker \
    JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200" \
    SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/campushop?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=America/Sao_Paulo&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8 \
    SPRING_DATASOURCE_USERNAME=root \
    SPRING_DATASOURCE_PASSWORD=123456 \
    SERVER_PORT=8080

# ==== Healthcheck ====
# Verifica se a aplicação está respondendo corretamente
# --interval: verifica a cada 30s
# --timeout: aguarda até 10s por resposta
# --start-period: aguarda 60s antes de começar (tempo para aplicação iniciar)
# --retries: tenta 3 vezes antes de marcar como unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# ==== Comando de Execução ====
# Usar shell para expandir variáveis de ambiente
# -Djava.security.egd: melhora performance de geração de números aleatórios
# -Dspring.profiles.active: profile do Spring
ENTRYPOINT ["sh", "-c", "echo '🚀 Iniciando CampuShop...' && java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
