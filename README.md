<div align="center">
	<img src="./campuShopcapa.png" width="50%" height="auto">
</div>

# CampuShop - Seu Marketplace Estudantil

O **CampuShop** conecta estudantes que querem comprar e vender produtos de forma simples e segura dentro da comunidade acadêmica.

Em vez de procurar em vários grupos e chats, a ideia é ter tudo em um só lugar: cadastro, vitrine de produtos, carrinho, pedidos e autenticação.

## 🛠️ Tecnologias

- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Banco de Dados:** MySQL 8
- **Ferramentas de Deploy:** Docker, Docker Compose

## 🧩 Visão geral (não técnica)

Pense no sistema como uma feira universitária organizada:

- **Usuário** = estudante com identificação (RA, email)
- **Produto** = item anunciado por um estudante
- **Carrinho** = cesta temporária para decidir o que comprar
- **Pedido** = compra finalizada
- **Itens** = detalhamento de cada produto dentro do carrinho/pedido

Assim, o banco de dados funciona como o "caderno oficial" da feira: guarda quem vende, quem compra, o que foi anunciado e o que foi comprado.

## 🗄️ Banco de Dados (didático)

Esta seção foi feita para ser compreensível por dev júnior, estagiário ou pessoa não técnica.

### Entidades principais

- `usuarios`: cadastro do estudante
- `produtos`: anúncios de venda
- `carrinhos`: carrinho ativo de cada cliente
- `itens_carrinho`: produtos dentro do carrinho
- `pedidos`: compra fechada
- `itens_pedido`: itens de cada pedido

### Diagrama ER (DER)

<div align="center">
	<img src="./src/main/resources/static/assets/diagrama%20er%20board.png" alt="Diagrama ER do CampuShop" width="100%" height="auto">
</div>

## 📁 Scripts de BD versionados, ordenados e testáveis

Os scripts ficam em `db/scripts` e seguem ordem numérica:

1. `db/scripts/001_schema.sql` → cria estrutura (tabelas e relacionamentos)
2. `db/scripts/002_seed.sql` → dados iniciais para teste
3. `db/scripts/003_validate.sql` → validação pós-implantação
4. `db/scripts/999_rollback.sql` → rollback/limpeza do esquema

## 📌 Pré-requisitos

- Docker Desktop instalado
- `docker compose` disponível no terminal
- Porta `3306` livre (MySQL)
- Porta `8080` livre (aplicação)

## 🚀 Guia de implantação do zero (máquina limpa)

### 🔹 Passo 1: Preparar ambiente

No diretório raiz do projeto:

```powershell
cd C:\Users\aluno.senai\Documents\CAMPUSHOP
docker compose up -d mysql
```

### 🔹 Passo 2: Criar e estruturar o banco

```powershell
docker cp .\db\scripts\001_schema.sql campushop-mysql:/tmp/001_schema.sql
docker compose exec mysql sh -c "mysql -uroot -p123456 < /tmp/001_schema.sql"
```

### 🔹 Passo 3: Executar scripts versionados

```powershell
docker cp .\db\scripts\002_seed.sql campushop-mysql:/tmp/002_seed.sql
docker compose exec mysql sh -c "mysql -uroot -p123456 < /tmp/002_seed.sql"

docker cp .\db\scripts\003_validate.sql campushop-mysql:/tmp/003_validate.sql
docker compose exec mysql sh -c "mysql -uroot -p123456 < /tmp/003_validate.sql"
```

### 🔹 Passo 4: Subir aplicação

```powershell
docker compose up -d --build
docker compose ps
```

Acesse: `http://localhost:8080`

## ✅ Validação pós-implantação

- Execute `db/scripts/003_validate.sql`
- Confirme que as tabelas retornam contagem sem erro
- Acesse a aplicação em `http://localhost:8080`
- Valide login/cadastro e listagem de produtos

Consulta rápida de conferência:

```sql
USE campushop;
SHOW TABLES;
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM produtos;
```

## ♻️ Rollback / Limpeza

Se precisar desfazer estrutura e dados do banco:

1. Execute `db/scripts/999_rollback.sql`
2. (Opcional) remover volumes Docker para reset total:

```powershell
docker compose down -v
```

## 📦 Execução local sem Docker (opcional)

### Backend

```powershell
mvn spring-boot:run
```

### Frontend (desenvolvimento com hot reload)

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend/API: `http://localhost:8080`

## 📂 Estrutura essencial

- `src/main/java` → código backend
- `src/main/resources` → templates e arquivos estáticos servidos pelo Spring
- `frontend` → código-fonte React
- `db/scripts` → scripts SQL versionados
- `docker-compose.yml` → orquestração de app + banco

---

Projeto desenvolvido por **Caio, Jhonathas, Julia, Pedro e Mateus**.
