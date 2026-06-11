# Deploy no Render — Frontend (Static) + Backend (Web Service)

Resumo rápido:
- Defina o `VITE_API_URL` antes do build do frontend (ou no painel do Render) — o Vite embute essa URL no bundle durante o build.
- Configure o Static Site para `frontend` com `dist` como pasta de publicação e habilite fallback SPA.
- Configure o Web Service (backend) com `mvn -DskipTests package` e `java -jar target/*.jar` como start.

Passos recomendados:

1) Preparar o database (se usar):
   - No Render: New → Database → Postgres. Copie a connection string.

2) Deploy do backend (Web Service):
   - New → Web Service → conectar ao repo
   - Root directory: deixar na raiz (onde está `pom.xml`)
   - Build command: `mvn -DskipTests package`
   - Start command: `java -jar target/*.jar`
   - Defina variáveis de ambiente necessárias (ex.: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`)
   - Health check: `/actuator/health` (se habilitado)

3) Deploy do frontend (Static Site):
   - New → Static Site → conectar ao repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variable obrigatória: `VITE_API_URL` = `https://<seu-backend>.onrender.com`
   - Habilitar: "Redirect all routes to /index.html" (SPA routing)

4) Ordem prática:
   - Crie DB → Faça deploy do backend → copie a URL pública do backend → configure `VITE_API_URL` no Static Site → redeploy do frontend.

5) Testes locais (opcional):
```bash
# Frontend
cd frontend
npm install
npm run build
npm run preview

# Backend
mvn -DskipTests package
java -jar target/*.jar
```

6) Nota sobre CORS:
 - O backend atualmente permite só `localhost` em `SecurityConfig`. Recomendo definir as origens via variável `SPRING_ALLOWED_ORIGINS`.
 - Exemplo de leitura em `SecurityConfig.corsConfigurationSource()`:

```java
String allowed = System.getenv().getOrDefault("SPRING_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000");
List<String> origins = Arrays.asList(allowed.split(","));
configuration.setAllowedOrigins(origins);
```

7) Verificação pós-deploy:
 - Abra o frontend público e verifique no DevTools → Network se as chamadas vão para a URL definida em `VITE_API_URL`.
 - Verifique logs do backend no painel do Render em caso de erros.

Se quiser, eu posso adicionar `render.yaml` ao repositório para descrever os serviços ou aplicar a alteração em `SecurityConfig` para ler `SPRING_ALLOWED_ORIGINS` automaticamente.
