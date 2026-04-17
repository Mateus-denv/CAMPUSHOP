# ⚙️ Backend - Configurações

## 📋 Visão Geral

Os arquivos de configuração definem como a aplicação se comporta em diferentes ambientes e como os componentes interagem.

**Localização:** `src/main/java/br/com/campushop/campushop_backend/config/`

---

## 🗄️ DatabaseSeeder

**Arquivo:** `DatabaseSeeder.java`

**Descrição:** Popula o banco de dados com dados iniciais na primeira execução.

```java
@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Executado automaticamente ao iniciar a aplicação
        seedDatabase();
    }

    private void seedDatabase() {
        // Se dados já existem, não faz nada
        if (categoriaRepository.count() > 0) {
            return;
        }

        // Cria categorias
        Categoria eletronicos = new Categoria();
        eletronicos.setNomeCategoria("Eletrônicos");
        eletronicos.setDescricao("Produtos eletrônicos em geral");
        categoriaRepository.save(eletronicos);

        Categoria livros = new Categoria();
        livros.setNomeCategoria("Livros");
        livros.setDescricao("Livros acadêmicos e técnicos");
        categoriaRepository.save(livros);

        // Cria usuários de teste
        Usuario usuarioTeste = new Usuario();
        usuarioTeste.setNomeCompleto("Usuário Teste");
        usuarioTeste.setEmail("teste@example.com");
        usuarioTeste.setRa("2022000000");
        usuarioTeste.setSenha(passwordEncoder.encode("senha123"));
        usuarioTeste.setAtivado(true);
        usuarioRepository.save(usuarioTeste);

        System.out.println("✅ Banco de dados populado com sucesso!");
    }
}
```

### O que Faz

1. Verifica se dados já existem
2. Se vazio, insere dados iniciais
3. Cria categorias padrão
4. Cria usuários de teste
5. Define dados relacionados

### Quando Roda

- Automaticamente ao iniciar a aplicação
- Implementa `CommandLineRunner`
- Método `run()` é chamado ao startup

---

## 📅 LocalDateDeserializer

**Arquivo:** `LocalDateDeserializer.java`

**Descrição:** Custom deserializer para converter JSON em LocalDate.

```java
public class LocalDateDeserializer extends JsonDeserializer<LocalDate> {

    private static final DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public LocalDate deserialize(
        JsonParser jsonParser,
        DeserializationContext deserializationContext)
        throws IOException {

        String date = jsonParser.getText();
        return LocalDate.parse(date, formatter);
    }
}
```

### Uso

```java
@JsonDeserialize(using = LocalDateDeserializer.class)
private LocalDate dataNascimento;
```

### Exemplo de Conversão

**JSON de entrada:**

```json
{
  "dataNascimento": "2000-05-15"
}
```

**Convertido para:**

```java
LocalDate dataNascimento = LocalDate.of(2000, 5, 15);
```

---

## 🔒 SecurityConfig

**Arquivo:** `SecurityConfig.java`

**Descrição:** Configuração centralizad de segurança (detalhado em 05_SECURITY.md).

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
        throws Exception {

        // Configurações de autenticação e autorização
        http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        return http.build();
    }
}
```

---

## 📝 application.properties

**Arquivo:** `src/main/resources/application.properties`

**Descrição:** Configurações da aplicação.

```properties
# ==================== SPRING ====================
spring.application.name=campushop_backend
server.port=8080

# ==================== DATABASE ====================
spring.datasource.url=jdbc:mysql://localhost:3306/campushop
spring.datasource.username=root
spring.datasource.password=root

# MySQL Driver
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ==================== JPA/Hibernate ====================
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# ==================== JWT ====================
jwt.secret=sua_chave_secreta_super_segura_aqui
jwt.expiration=86400000  # 24 horas em millisegundos

# ==================== LOGGING ====================
logging.level.root=INFO
logging.level.br.com.campushop=DEBUG
logging.level.org.springframework.security=DEBUG

# ==================== CORS ====================
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# ==================== FILE UPLOAD ====================
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Variáveis por Ambiente

**Development (application-dev.properties):**

```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
logging.level.root=DEBUG
```

**Production (application-prod.properties):**

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.root=INFO
jwt.expiration=3600000  # 1 hora
```

### Como Usar Variáveis de Ambiente

```bash
# Linux/Mac
export SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/campushop
export SPRING_DATASOURCE_PASSWORD=senha_prod_segura
java -jar app.jar

# Windows
set SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/campushop
set SPRING_DATASOURCE_PASSWORD=senha_prod_segura
java -jar app.jar
```

---

## 🌐 CORS Configuration

Se necessário configurar CORS customizado:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

---

## 📊 Estrutura de Beans Spring

```
@Configuration
  │
  ├─ @Bean PasswordEncoder
  ├─ @Bean SecurityFilterChain
  ├─ @Bean CorsConfig
  │
@Component (Singleton)
  │
  ├─ @Service
  │  ├─ UsuarioService
  │  ├─ ProdutoService
  │  └─ CarrinhoService
  │
  ├─ @Repository
  │  ├─ UsuarioRepository
  │  ├─ ProdutoRepository
  │  └─ CarrinhoRepository
  │
  ├─ @RestController
  │  ├─ AuthController
  │  ├─ ProdutoController
  │  └─ CarrinhoController
  │
  ├─ @Component
  │  ├─ JwtTokenProvider
  │  ├─ JwtAuthenticationFilter
  │  └─ DatabaseSeeder
  │
  └─ CommandLineRunner
     └─ DatabaseSeeder
```

---

## 📋 Anotações de Configuração

| Anotação          | Escopo | Descrição                               |
| ----------------- | ------ | --------------------------------------- |
| `@Configuration`  | Classe | Define classe de configuração           |
| `@Bean`           | Método | Define bean gerenciado por Spring       |
| `@Service`        | Classe | Marca como serviço (lógica de negócio)  |
| `@Component`      | Classe | Marca como componente genérico          |
| `@Repository`     | Classe | Marca como repositório (acesso a dados) |
| `@RestController` | Classe | Controlador REST (retorna JSON)         |
| `@Autowired`      | Campo  | Injeção de dependência                  |
| `@Value`          | Campo  | Injeta valor de properties              |
| `@Transactional`  | Método | Define transação de BD                  |

---

## 🚀 Iniciação da Aplicação

### Sequência de Startup

```
1. Spring Boot inicia
   └─ Carrega application.properties

2. Configura banco de dados
   └─ Conecta ao MySQL

3. Inicializa Hibernate
   └─ Cria/atualiza tabelas (ddl-auto)

4. Cria beans Spring
   └─ PasswordEncoder
   └─ Repositories
   └─ Services
   └─ Controllers

5. Registra listeners
   └─ CommandLineRunner (DatabaseSeeder)

6. DatabaseSeeder.run() executa
   └─ Popula banco se vazio

7. Registra filtros
   └─ JwtAuthenticationFilter

8. Inicia servidor
   └─ Escuta em localhost:8080

9. Aplicação pronta para requisições
```

---

## 🔧 Configuração de Logging

### application.properties

```properties
logging.level.root=INFO
logging.level.br.com.campushop=DEBUG
logging.level.org.springframework=INFO
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Arquivo de saída

```properties
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=10
```

---

## 📦 Maven Configuration

**Arquivo:** `pom.xml`

Dependências principais:

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>

    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

---

## 🎯 Próximos Passos

- Veja [02_CONTROLLERS.md](./02_CONTROLLERS.md) para endpoints
- Veja [03_SERVICES.md](./03_SERVICES.md) para lógica de negócio
- Veja [05_SECURITY.md](./05_SECURITY.md) para segurança detalhada
