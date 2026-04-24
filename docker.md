# Instruções de Execução com Seed Automático

## Subir ambiente completo
- docker compose up -d --build

## Como funciona a carga de dados
- O MySQL executa automaticamente `001_schema.sql` e `002_seed.sql` via `/docker-entrypoint-initdb.d`.
- Essa execução automática ocorre **somente na primeira criação** do volume `campushop_mysql_data`.

## Parar ambiente
- docker compose down

## Subir novamente sem perder dados
- docker compose up -d

## Reset total (recriar banco e reaplicar seed)
- Use quando quiser simular "primeira instalação" em outra máquina.
- docker compose down -v
- docker compose up -d --build

## Ver status
- docker compose ps