# CampusShop Frontend

Frontend em Vite + React para o CampusShop.

## Rodar

```bash
cd frontend
npm install
npm run dev
```

## Build

````bash
cd frontend
npm run build
```# CampusShop Frontend

React + TypeScript + Vite + Tailwind CSS

## Desenvolvimento (frontend isolado)

```bash
cd frontend
npm install
npm run dev
````

Abre em `http://localhost:5173`

O proxy automático encaminha requisições de `/api` para `http://localhost:8080`

## Produção local integrada (localhost único)

Para servir frontend + backend no mesmo endereço (`http://localhost:8080`), gere o build do React diretamente em `src/main/resources/static`:

```bash
cd frontend
npm run build
```

Depois suba o Spring Boot na raiz do projeto.

## Estrutura

```
src/
  pages/           # Páginas principais
  components/      # Componentes reutilizáveis
  lib/            # Utils (API client, validators)
  store/          # Zustand stores
  index.css       # Tailwind global
```

## Build

```bash
npm run build
```

Saída do build: `../src/main/resources/static`
