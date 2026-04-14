### Instruções de Execução

## Iniciar containers em background (libera terminal)

- docker compose up -d --build

## Parar containers

- docker compose down

## Ver status

- docker compose ps

## Ver logs da aplicação

- docker compose logs -f app

## Rebuild completo (sem cache)

- docker compose down
- docker compose build --no-cache
- docker compose up -d
