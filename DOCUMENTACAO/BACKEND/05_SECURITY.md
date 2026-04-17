# 🔐 Backend - Segurança e Autenticação JWT

## 📋 Visão Geral

A segurança da aplicação é baseada em:

- **Spring Security** - Framework de segurança
- **JWT (JSON Web Tokens)** - Tokens stateless para autenticação
- **BCrypt** - Criptografia de senhas

**Localização:** `src/main/java/br/com/campushop/campushop_backend/security/`

---

## 🎫 O que é JWT?

JWT (JSON Web Token) é um padrão para criar tokens de autenticação stateless.

**Estrutura:** `header.payload.signature`

### Exemplo Real:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvYW8gU2lsdmEiLCJpYXQiOjE1MTYyMzkwMjJ9
.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

### Partes:

1. **Header (Base64)**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

2. **Payload (Base64)**

```json
{
  "sub": "1",
  "email": "joao@example.com",
  "iat": 1516239022,
  "exp": 1516242622
}
```

3. **Signature (Criptografado)**

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

---

## 🔑 JwtTokenProvider

**Arquivo:** `JwtTokenProvider.java`

**Descrição:** Responsável por gerar e validar JWT tokens.

### Configurações

```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;  // Chave secreta para assinar

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;  // Tempo de expiração (em ms)

    // Exemplo em application.properties:
    // jwt.secret=sua_chave_secreta_super_segura_aqui
    // jwt.expiration=86400000  (24 horas)
}
```

### Método 1: **generateToken(UserDetails userDetails)**

Gera um novo JWT token.

```java
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();

    // Adiciona informações do usuário ao token
    claims.put("email", userDetails.getUsername());
    claims.put("roles", userDetails.getAuthorities());

    return Jwts.builder()
        .setClaims(claims)
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
        .signWith(SignatureAlgorithm.HS512, jwtSecret)
        .compact();
}
```

**Exemplo de token gerado:**

```
eyJhbGciOiJIUzUxMiJ9.eyJlbWFpbCI6ImpvYW9AZXhhbXBsZS5jb20iLCJzdWIiOiJqb2FvQGV4YW1wbGUuY29tIiwiaWF0IjoxNjEzMzcxMTAxLCJleHAiOjE2MTMzNzcxMDF9.sig_here
```

---

### Método 2: **getUserEmailFromToken(String token)**

Extrai email do token.

```java
public String getUserEmailFromToken(String token) {
    return Jwts.parser()
        .setSigningKey(jwtSecret)
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
}
```

**Uso:**

```java
String token = "eyJhbGciOiJIUzUxMiJ9...";
String email = jwtTokenProvider.getUserEmailFromToken(token);
// Retorna: "joao@example.com"
```

---

### Método 3: **validateToken(String token)**

Valida se o token é válido e não expirou.

```java
public boolean validateToken(String token) {
    try {
        Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token);
        return true;
    } catch (MalformedJwtException e) {
        logger.error("JWT malformado: {}", e);
        return false;
    } catch (ExpiredJwtException e) {
        logger.error("JWT expirado: {}", e);
        return false;
    } catch (UnsupportedJwtException e) {
        logger.error("JWT não suportado: {}", e);
        return false;
    } catch (IllegalArgumentException e) {
        logger.error("JWT claims vazio: {}", e);
        return false;
    }
}
```

**Exceções Possíveis:**

- `ExpiredJwtException` - Token expirou
- `MalformedJwtException` - Token inválido
- `UnsupportedJwtException` - Tipo de token não suportado
- `SignatureException` - Assinatura inválida

---

## 🔒 JwtAuthenticationFilter

**Arquivo:** `JwtAuthenticationFilter.java`

**Descrição:** Filter que intercepta requisições e valida JWT tokens.

### Como Funciona

```java
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. Extrai token do header Authorization
            String jwt = getJwtFromRequest(request);

            // 2. Se houver token, valida
            if (jwt != null && tokenProvider.validateToken(jwt)) {
                // 3. Extrai email do token
                String email = tokenProvider.getUserEmailFromToken(jwt);

                // 4. Carrega dados do usuário
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // 5. Cria autenticação
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );

                // 6. Define no SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Não foi possível definir autenticação: {}", e);
        }

        // 7. Continua o filtro
        filterChain.doFilter(request, response);
    }

    // Extrai token do header "Authorization: Bearer <token>"
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);  // Remove "Bearer "
        }

        return null;
    }
}
```

### Fluxo de uma Requisição com Token

```
1. Cliente envia requisição com header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

2. JwtAuthenticationFilter intercepta

3. Extrai token:
   token = "eyJhbGciOiJIUzI1NiJ9..."

4. Valida token:
   - Verifica assinatura
   - Verifica expiração
   - Se inválido → lança exceção

5. Se válido, extrai email:
   email = "joao@example.com"

6. Busca usuário:
   userDetails = CustomUserDetailsService.loadUserByUsername(email)

7. Cria autenticação:
   auth = new UsernamePasswordAuthenticationToken(...)

8. Define no SecurityContext:
   SecurityContextHolder.getContext().setAuthentication(auth)

9. Requisição continua autenticada

10. Controller pode acessar:
    @GetMapping("/me")
    public Usuario me(@AuthenticationPrincipal UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername());
    }
```

---

## 🔐 SecurityConfig

**Arquivo:** `SecurityConfig.java`

**Descrição:** Configuração centralizada de segurança.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // Criptografia BCrypt
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Desabilita CSRF (não precisa em API REST com JWT)
            .csrf().disable()

            // Permite acesso público aos endpoints de auth
            .authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .antMatchers("/").permitAll()
                .anyRequest().authenticated()  // Resto precisa autenticação

            // Adiciona JWT filter
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

            // Sem sessão (stateless)
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        return http.build();
    }
}
```

---

## 🛡️ BCrypt - Criptografia de Senhas

**O que é BCrypt?**

- Algoritmo de hash one-way (não reversível)
- Adiciona salt automático
- Adaptativo (fica mais lento com tempo)
- Padrão de segurança em produção

### Exemplo de Uso

```java
PasswordEncoder encoder = new BCryptPasswordEncoder();

// Criptografa senha
String senhaPlaintext = "minhasenha123";
String senhaCriptografada = encoder.encode(senhaPlaintext);
// Resultado: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36CHhAPm

// Compara senha fornecida com hash armazenado
boolean senhaCorreta = encoder.matches("minhasenha123", senhaCriptografada);
// Retorna: true

boolean senhaErrada = encoder.matches("outrasenha", senhaCriptografada);
// Retorna: false
```

### Fluxo de Registro de Usuário

```
1. Usuário submete senha em plaintext: "minhasenha123"

2. Backend recebe via HTTPS

3. PasswordEncoder.encode() criptografa:
   $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36CHhAPm

4. Salva no BD (nunca plaintext!)

5. Quando usuário faz login:
   - Recebe senha em plaintext
   - Compara com PasswordEncoder.matches()
   - Se match, gera JWT token
   - Nunca descriptografa
```

---

## 🚀 Fluxo Completo de Autenticação

### 1. Registro

```
POST /api/auth/register
Body:
{
  "email": "joao@example.com",
  "senha": "minhasenha123",
  ...
}

↓

AuthController.register()
  ├─> UsuarioService.salvar()
  │   ├─> PasswordEncoder.encode()  [Criptografa]
  │   └─> UsuarioRepository.save()  [Salva no BD]
  │
  ├─> CustomUserDetailsService.loadUserByUsername()
  │   └─> UsuarioRepository.findByEmail()
  │
  └─> JwtTokenProvider.generateToken()  [Gera JWT]

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { id, email, nome }
}
```

### 2. Login

```
POST /api/auth/login
Body:
{
  "email": "joao@example.com",
  "senha": "minhasenha123"
}

↓

AuthController.login()
  ├─> UsuarioService.autenticar()
  │   ├─> UsuarioRepository.findByEmail()
  │   └─> PasswordEncoder.matches()  [Verifica]
  │
  ├─> CustomUserDetailsService.loadUserByUsername()
  │
  └─> JwtTokenProvider.generateToken()

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { id, email, nome }
}
```

### 3. Requisição Autenticada

```
GET /api/produtos
Header:
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

↓

JwtAuthenticationFilter
  ├─> Extrai token do header
  ├─> JwtTokenProvider.validateToken()
  ├─> JwtTokenProvider.getUserEmailFromToken()
  ├─> CustomUserDetailsService.loadUserByUsername()
  └─> SecurityContextHolder.setAuthentication()

↓

ProdutoController.listar()
  └─> Executa normalmente (autenticado)

Response:
[{ produtos... }]
```

---

## ⚠️ Segurança - Melhores Práticas

### ✅ O que Fazemos

- ✅ Senhas criptografadas com BCrypt
- ✅ Tokens JWT com expiração
- ✅ Validação de token em cada requisição
- ✅ HTTPS em produção (não em dev)
- ✅ Proteção CSRF desabilitada (API REST)
- ✅ Logs de tentativas de autenticação

### ⚠️ Precauções Importantes

**Nunca:**

- ❌ Armazene senhas em plaintext
- ❌ Exponha chaves secretas no código
- ❌ Use HTTP em produção (sem HTTPS)
- ❌ Faça log de senhas
- ❌ Expresse senhas em logs ou erros

**Sempre:**

- ✅ Use variáveis de ambiente para secrets
- ✅ Configure expiração de token apropriada
- ✅ Valide input do usuário
- ✅ Use HTTPS em produção
- ✅ Revise logs de segurança

---

## 🔧 Configuração em application.properties

```properties
# JWT
jwt.secret=${JWT_SECRET:sua_chave_secreta_super_segura_aqui}
jwt.expiration=${JWT_EXPIRATION:86400000}  # 24 horas em ms

# Security
server.servlet.session.tracking-modes=none
```

---

## 📋 Endpoints de Autenticação

| Método | Endpoint             | Autenticação | Descrição                    |
| ------ | -------------------- | ------------ | ---------------------------- |
| POST   | `/api/auth/register` | Não          | Registrar novo usuário       |
| POST   | `/api/auth/login`    | Não          | Fazer login                  |
| GET    | `/api/auth/me`       | Sim          | Dados do usuário autenticado |
| POST   | `/api/auth/logout`   | Sim          | Fazer logout                 |

---

## 🎯 Próximos Passos

- Veja [02_CONTROLLERS.md](./02_CONTROLLERS.md) para ver uso em controllers
- Veja [03_SERVICES.md](./03_SERVICES.md) para ver uso em services
- Veja [06_CONFIG.md](./06_CONFIG.md) para outras configurações
