# CampusShop

Marketplace estudantil com backend em Spring Boot e frontend em React + Vite.

## Stack

- Backend: Java 17, Spring Boot, Spring Security, JPA
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Banco: MySQL (ou configuração definida em `src/main/resources/application.properties`)

## Estrutura essencial

- `src/main/java`: código backend
- `src/main/resources/static`: frontend compilado servido pelo Spring Boot
- `frontend`: código-fonte React
- `pom.xml`: build Maven do backend

## Executar local (localhost único)

1. Build do frontend para o backend servir os arquivos atualizados:

```powershell
cd frontend
npm install
npm run build
```

2. Subir o backend:

```powershell
cd ..
mvn spring-boot:run
```

3. Acessar:

- `http://localhost:8080`

## Desenvolvimento do frontend (hot reload)

Para desenvolvimento visual rápido:

```powershell
cd frontend
npm install
npm run dev
```

- Frontend em: `http://localhost:5173`
- API proxied para: `http://localhost:8080`

## Docker

```powershell
docker compose up -d --build
docker compose ps
```

Parar containers:

```powershell
docker compose down
```

Também pode usar os scripts `run-docker.ps1` ou `run-docker.bat`.
