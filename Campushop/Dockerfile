# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copiar arquivos de configuração Maven
COPY pom.xml .

# Baixar dependências (cache layer)
RUN mvn dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Compilar aplicação
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copiar JAR da build stage
COPY --from=build /app/target/*.jar app.jar

# Expor porta
EXPOSE 8080

# Variáveis de ambiente para MySQL
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/campushop?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=123456

# Executar aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
