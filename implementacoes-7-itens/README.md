# Implementações (7 Itens Críticos) — Passo a passo + Problemas anteriores

> Pasta: `implementacoes-7-itens/`
>
> Objetivo deste README: documentar **o que já existe no seu repo** (backend) para os **7 itens críticos** e principalmente **quais problemas estavam acontecendo antes** e como foram corrigidos.

---

## Como ler este documento
- **O que foi feito**: onde/que código foi ajustado.
- **Como funciona**: fluxo interno do mecanismo.
- **Problemas anteriores**: os erros/bugs que impediram o projeto de funcionar/compilar corretamente.
- **Resultado final**: comportamento esperado depois da correção.

---

## 1) Global Error Handling (GlobalExceptionHandler)

### Onde está
- `src/main/java/br/com/campushop/campushop_backend/exceptions/GlobalExceptionHandler.java`

### O que foi feito
1. Garantir que o handler global responda erros em formato consistente usando `ErrorResponse`.
2. Remover o handler genérico que virava “catch-all” para `RuntimeException` (isso podia mascarar status corretos e transformar cenários que deveriam ser 404/401/403 em 400).
3. Manter handlers explícitos:
   - Validação: `MethodArgumentNotValidException` → **400**
   - Recurso não encontrado: `ResourceNotFoundException` → **404**
   - Credenciais inválidas: `BadCredentialsException` → **401**
   - Acesso negado: `AccessDeniedException` → **403**
   - `IllegalArgumentException` → **400**
   - fallback `Exception` → **500**

### Como funciona
- O arquivo é um `@RestControllerAdvice`.
- Quando o Spring captura uma exceção lançada por controllers/services:
  - ele escolhe o método anotado com `@ExceptionHandler` mais específico;
  - retorna `ResponseEntity<ErrorResponse>`.

### Problemas anteriores (que davam “Global e AuthController com erro”)
- **Erro de compilação por sintaxe corrompida**: o arquivo do handler ficou com “resíduo” de código fora da classe em algumas tentativas anteriores (ex: erro tipo *“statements not expected outside of methods”*).
- Além disso, existia configuração anterior que poderia **mascarar status** por causa de um handler genérico amplo.

### Resultado final
- GlobalExceptionHandler está funcional e coerente com o padrão HTTP esperado.
- Não transforma “não encontrado” em “bad request” indevidamente.

---

## 2) Input Validation (principalmente Login com @Valid)

### Onde está
- `src/main/java/br/com/campushop/campushop_backend/dto/LoginRequest.java`
- `src/main/java/br/com/campushop/campushop_backend/controller/AuthController.java`

### O que foi feito
1. Adicionar validações no DTO `LoginRequest`:
   - `@NotBlank` no `email` e `senha`
   - `@Email` no `email`
2. No controller, garantir que o login use validação automática:
   - `public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request)`

### Como funciona
- Quando o body do endpoint `/api/auth/login` chega:
  - o Spring valida o JSON com as anotações do DTO;
  - se inválido, lança `MethodArgumentNotValidException`;
  - o `GlobalExceptionHandler` transforma isso em **400** com o formato do `ErrorResponse`.

### Problemas anteriores
- `LoginRequest` não tinha validação via Jakarta Validation.
- `AuthController.login` dependia mais de validação manual (com respostas em estrutura diferente), o que fazia testes/contratos falharem.

### Resultado final
- Erros de input do login passam pelo fluxo padrão do GlobalExceptionHandler (contrato consistente).

---

## 3) Swagger / OpenAPI

### Onde está
- `src/main/java/br/com/campushop/campushop_backend/config/SwaggerConfig.java`
- `src/main/resources/application.properties` (config de caminhos)

### O que foi feito
- O repo já tem o `springdoc-openapi-starter-webmvc-ui` no `pom.xml`.
- `SwaggerConfig` registra:
  - metadados (title/description/version/contact)
  - segurança Bearer JWT.

### Como funciona
- Swagger é montado automaticamente pelo `springdoc`.
- Os endpoints anotados e/ou mapeados aparecem na UI.

### Resultado final
- A UI deve ficar disponível em `http://localhost:8080/api/swagger-ui.html` (conforme propriedades do projeto).

---

## 4) Rate Limiting

### Onde está
- `src/main/java/br/com/campushop/campushop_backend/security/RateLimitFilter.java`
- `src/main/java/br/com/campushop/campushop_backend/config/RateLimitCache.java`

### O que foi feito
- O projeto usa rate limit via filtro + cache em memória.
- Foi reforçado para evitar crescimento infinito de memória:
  - existe `cleanup()` no `RateLimitCache` (limpa entradas antigas)
  - o filtro executa `cleanup()` periodicamente (ex.: a cada N requisições do filtro)

### Como funciona
- Para cada request:
  - calcula IP do cliente (`X-Forwarded-For` se existir, senão `remoteAddr`)
  - consulta/atualiza contador na janela temporal
  - se estourar limite: responde **429** com JSON

### Problemas anteriores
- Sem `cleanup()` ou com cleanup insuficiente, o mapa de buckets/contadores pode crescer indefinidamente.

### Resultado final
- Rate limit funciona e o cache não cresce eternamente.

---

## 5) Testes Automatizados

### Onde estão
- `src/test/java/br/com/campushop/campushop_backend/controller/AuthControllerTest.java`
- `src/test/java/br/com/campushop/campushop_backend/service/UsuarioServiceTest.java`
- outros testes em `src/test/java/service/`

### O que foi feito
- Garantir que testes do Auth são compatíveis com:
  - o contrato atual do controller
  - validação via DTO e `@Valid`
  - status codes esperados (400/401/etc.)

### Como funciona
- `AuthControllerTest` usa:
  - `@SpringBootTest`
  - `@AutoConfigureMockMvc`
  - `MockMvc` para chamar endpoints

### Problemas anteriores
- Um dos momentos anteriores ficou com `AuthControllerTest.java` quebrado (muitos erros sintáticos/compilação no IDE).
- Depois foi restaurado ao estado correto para compilar e validar comportamento.

### Resultado final
- O projeto passou por compilação com Maven.

---

## 6) Email Verification (verificação por token)

### Onde está
- `src/main/java/br/com/campushop/campushop_backend/model/VerificationToken.java`
- `src/main/java/br/com/campushop/campushop_backend/service/EmailService.java`
- `src/main/java/br/com/campushop/campushop_backend/controller/AuthController.java` (endpoint de verificação)

### O que foi feito
- O fluxo existe no repo e foi ajustado para não quebrar com token inválido/curto.

### Como funciona (alto nível)
- Quando o usuário é cadastrado:
  - um token de verificação é gerado e guardado em `VerificationToken`.
  - o link vai para o front: `app.frontend.url + /verificar-email?token=...`.
- Quando o usuário acessa:
  - endpoint `/api/auth/verificar-email?token=...` chama o `EmailService.verificarToken(token)`.
  - o service valida expiração e marca como verificado.

### Problemas anteriores
- Possível exceção em `EmailService` por manipulação de substring do token sem validar tamanho (ex.: token null/curto).

### Resultado final
- `verificarEmail`/`verificarToken` ficam robustos para token inválido, sem quebrar a API.

---

## 7) Password Reset (solicitar reset + resetar senha com token)

### Onde está
- `src/main/java/br/com/campushop/campushop_backend/dto/ResetSenhaRequestDTO.java`
- `src/main/java/br/com/campushop/campushop_backend/controller/AuthController.java`
- `src/main/java/br/com/campushop/campushop_backend/service/UsuarioService.java`
- `src/main/java/br/com/campushop/campushop_backend/service/EmailService.java`

### O que foi feito
- Endpoint `/api/auth/solicitar-reset`:
  - recebe email
  - sempre retorna OK (não revela se email existe)
- Endpoint `/api/auth/resetar-senha`:
  - recebe `token`, `novaSenha`, `confirmacaoSenha`
  - validação via `@Valid @RequestBody`
  - troca a senha, invalida token

### Como funciona (alto nível)
- Solicitação:
  - se usuário existir → cria token e envia email com link do reset
- Reset:
  - valida token e expiração
  - atualiza senha e remove/invalida token

### Problemas anteriores
- Dependência de validação manual/contrato inconsistente com o handler global.
- Token inválido/expirado precisa ser tratado com status correto via `GlobalExceptionHandler` (ou por exceção do service).

### Resultado final
- Fluxo de reset está conectado com `EmailService` e com persistência/invalidação do token.

---

## Resultado final geral (o que foi verificado)
- As correções feitas foram direcionadas a **compilar e manter contrato HTTP consistente**.
- O fluxo do auth foi alinhado com:
  - validação do DTO via `@Valid`
  - respostas padrão do `GlobalExceptionHandler`

---

## Próximo passo (recomendado)
Se você quiser garantir 100%:
- rodar `mvn test` (não só compile)
- e executar os testes Python do guia (`guia-de-testes/testes-python/`).

