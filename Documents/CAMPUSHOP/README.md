<div align="center">
	<img src="./campuShopcapa.png" width="50%" height="auto">
</div>

# CampuShop - Seu Marketplace Estudantil

O **CampuShop** conecta estudantes que querem comprar e vender produtos de forma simples e segura dentro da comunidade acadêmica.

Em vez de procurar em vários grupos e chats, a ideia é ter tudo em um só lugar: cadastro, vitrine de produtos, carrinho, pedidos, chat, avaliações e autenticação.

## 🛠️ Tecnologias

- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Banco de Dados:** MySQL 8
- **Ferramentas de Deploy:** Docker, Docker Compose

## 🧩 Visão geral

Pense no sistema como uma feira universitária organizada:

- **Usuário** = estudante com identificação (RA, email)
- **Produto** = item anunciado por um estudante
- **Carrinho** = cesta temporária para decidir o que comprar
- **Pedido** = compra finalizada
- **Itens** = detalhamento de cada produto dentro do carrinho/pedido

Assim, o banco de dados funciona como o "caderno oficial" da feira: guarda quem vende, quem compra, o que foi anunciado e o que foi comprado.

## 🏗️ Arquitetura do Sistema

A arquitetura é crucial para o sucesso da implantação (`deployment`), pois define como o sistema será distribuído, configurado e executado no ambiente de produção.

A arquitetura de software é a organização fundamental de um sistema, composta por seus componentes, os relacionamentos entre eles e as diretrizes que governam seu design e evolução. Funciona como um "plano de construção" ou esqueleto, definindo como diferentes partes do software interagem.

No CampuShop, a arquitetura segue uma separação clara entre camadas e responsabilidades:

- **Cliente (Frontend):** interface React responsável pela experiência do usuário.
- **Aplicação (Backend):** API Spring Boot que centraliza regras de negócio, autenticação e integração com dados.
- **Persistência (Banco):** MySQL para armazenamento estruturado e consistente das informações.
- **Orquestração (Deploy):** Docker Compose para padronizar e simplificar execução local e em produção.

Essa organização reduz acoplamento, facilita manutenção, melhora escalabilidade e torna o processo de deploy mais previsível.

### Representação visual da arquitetura

```mermaid
flowchart LR
		U[Usuário] --> B[Navegador]
		B --> F[Frontend React + Vite]
		F -->|HTTP/JSON| A[Backend Spring Boot]
		A -->|JPA/Hibernate| D[(MySQL 8)]

		subgraph Deploy com Docker Compose
			F
			A
			D
			P[phpMyAdmin]
		end

		P --> D
```

## 🗄️ Banco de Dados

Esta seção descreve o modelo ER enviado no diagrama, de forma simples e direta.

### Entidades principais

- `USUARIO`: guarda os dados do cliente/vendedor com `id`, `email`, `cidade`, `nomeCliente`, `senha`, `telefone`, `tipo_conta`, `tipo_cliente`, `cpf_cnpj`, `instituicao_ensino`, `localizacao_gps`, `ativado` e `data_cadastro`.
- `PRODUTO`: armazena os anúncios com `idProduto`, `nome_produto`, `nome_amigavel`, `descricao`, `estoque`, `preco`, `dimensoes`, `imagem_blob`, `status`, `idCategoria` e `idVendedor`.
- `CATEGORIA`: classifica os produtos por `nome_categoria` e `descricao`.
- `VARIANTEPRODUTO`: representa variações do produto, com `nome_variante`, `preco_adicional` e `estoque_variante`.
- `CARRINHO`: registra itens adicionados ao carrinho com `id`, `idUsuario`, `idProduto`, `quantidade` e `data_adicao`.
- `PEDIDO`: registra a compra finalizada com `idPedido`, `data_pedido`, `valor_total`, `status_pedido`, `idCliente` e `idTipoPagamento`.
- `ITEMPEDIDO`: detalha os itens do pedido, com `idPedido`, `idProduto`, `quantidade`, `preco_unitario` e `subtotal`.
- `TIPOPAGAMENTO`: identifica a forma de pagamento, com `nome_tipo` e `descricao`.
- `CHAT`: armazena mensagens com `id`, `idRemetente`, `idDestinatario`, `idProduto`, `mensagem`, `data_hora` e `lida`.
- `AVALIACAO`: guarda avaliações com `id`, `idProduto`, `idUsuario`, `nota`, `comentario` e `data_avaliacao`.

### Como as tabelas se relacionam

- Um `USUARIO` vende produtos em `PRODUTO` (via `idVendedor`).
- Um `PRODUTO` pertence a uma `CATEGORIA` (via `idCategoria`).
- Um `PRODUTO` pode possuir várias linhas em `VARIANTEPRODUTO`.
- Um `USUARIO` adiciona produtos no `CARRINHO`.
- Um `USUARIO` realiza `PEDIDO` (via `idCliente`).
- Cada `PEDIDO` recebe um `TIPOPAGAMENTO` (via `idTipoPagamento`).
- Cada `PEDIDO` contém vários registros em `ITEMPEDIDO`.
- Cada `ITEMPEDIDO` referencia um `PRODUTO` e compõe o total do pedido.
- `CHAT` relaciona remetente e destinatário (`USUARIO`) e pode referenciar um `PRODUTO`.
- `AVALIACAO` liga `USUARIO` e `PRODUTO` para registrar nota e comentário.

### Diagrama ER (DER)

<div align="center">
	<img src="./src/main/resources/static/assets/diagrama er board.png" alt="Diagrama ER do CampuShop" width="100%" height="auto">
</div>

## 📁 Scripts de BD

Os scripts ficam em `db/scripts` e seguem ordem numérica:

1. `db/scripts/001_schema.sql` → cria a estrutura base do banco, seguindo o ER.
2. `db/scripts/002_seed.sql` → insere dados iniciais para testes e demonstração.
3. `db/scripts/003_validate.sql` → valida a implantação depois da criação das tabelas.
4. `db/scripts/999_rollback.sql` → remove a estrutura para limpeza ou recomeço.

## 📌 Pré-requisitos

- Docker Desktop instalado
- `docker compose` disponível no terminal
- Porta `3306` livre (MySQL)
- Porta `8080` livre (aplicação)
- Porta `8081` livre (phpMyAdmin)

## 🚀 Guia de implantação do zero

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

phpMyAdmin: `http://localhost:8081`

Credenciais do phpMyAdmin:

- Servidor: `mysql`
- Usuário: `root`
- Senha: `123456`

## ✅ Validação pós-implantação

- Execute `db/scripts/003_validate.sql`
- Confirme que as tabelas retornam contagem sem erro
- Acesse a aplicação em `http://localhost:8080`
- Acesse o phpMyAdmin em `http://localhost:8081`
- Valide login/cadastro e listagem de produtos

Consulta rápida de conferência:

```sql
USE campushop;
SHOW TABLES;
SELECT COUNT(*) FROM usuario;
SELECT COUNT(*) FROM produto;
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
