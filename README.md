<div align="center">
	<img src="./campuShopcapa.png" width="50%" height="auto">
</div>

# CampuShop - Seu Marketplace Estudantil

O **CampuShop** conecta estudantes para comprar e vender produtos dentro da comunidade acadêmica de forma simples, segura e organizada.

O sistema reúne registro de usuários, cadastro de anúncios, vitrine por categoria, carrinho de compras, pedidos, atendimento via chat e autenticação segura com JWT.

## 🛠️ Tecnologias

- **Backend:** Java 17, Spring Boot 3.1.5, Spring Security, Spring Data JPA
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

## ✨ Funcionalidades principais

- Cadastro e login de usuários com autenticação JWT.
- Anúncio de produtos com categoria, estoque, preço, imagens e status de visibilidade.
- Exploração da vitrine por categoria e página de detalhes de produto.
- Carrinho para adicionar, atualizar e remover itens de forma prática.
- Finalização de pedidos com controle de status e histórico de compras e vendas.
- Gestão de conta do usuário, edição de perfil e upload de foto.
- Interface de chat para negociação entre comprador e vendedor.
- Rotas protegidas para ações que exigem autenticação.

## 🏗️ Arquitetura do Sistema

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

Esta seção descreve o modelo ER atual do projeto de forma simples e direta.

### Entidades principais

- `USUARIO`: armazena dados do comprador/vendedor com `id`, `nomeCompleto`, `ra`, `email`, `senha`, `telefone`, `tipo_conta`, `cpf_cnpj`, `instituicao_ensino`, `localizacao_gps`, `ativado`, `data_nascimento`, `data_cadastro` e `saldo_vendas`.
- `PRODUTO`: guarda anúncios com `idProduto`, `nomeProduto`, `descricao`, `estoque`, `preco`, `status`, `visivelParaComprador`, `tipoProduto`, `dimensoes`, `peso`, `usaDimensoes`, `dimensaoComprimento`, `dimensaoLargura`, `idCategoria` e `id_usuario`.
- `CATEGORIA`: classifica produtos com `idCategoria`, `nome_categoria` e `descricao`.
- `CARRINHO`: registra itens no carrinho com `id`, `id_usuario`, `id_produto`, `quantidade` e `data_adicao`.
- `PEDIDO`: salva compras com `idPedido`, `id_usuario` (comprador), `id_vendedor`, `valor_pedido`, `status_pedido`, `data_pedido`, `chave_entrega`, `data_aprovacao`, `prazo_entrega_limite`, `data_entrega` e `motivo_rejeicao`.
- `PEDIDO_ITEM`: detalha os itens de cada pedido com `idPedidoItem`, `id_pedido`, `id_produto`, `quantidade` e `preco_unitario`.
- `IMAGEM_ANEXO`: armazena imagens e arquivos relacionados a produtos e usuários com `id_imagem`, `tipo`, `nome_arquivo`, `content_type`, `tamanho_bytes`, `dados`, `data_upload`, `id_usuario` e `id_produto`.

### Como as tabelas se relacionam

- Um `USUARIO` pode criar vários `PRODUTO`s como vendedor.
- Um `PRODUTO` pertence a uma `CATEGORIA` e a um `USUARIO` vendedor.
- Um `USUARIO` adiciona itens ao `CARRINHO` para montar seu pedido.
- Cada `PEDIDO` associa um comprador (`id_usuario`) e um vendedor (`id_vendedor`).
- Cada `PEDIDO` contém vários `PEDIDO_ITEM`s que apontam para os produtos comprados.
- `IMAGEM_ANEXO` permite vincular fotos de produto ou imagens de usuário ao sistema.

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

### Para rodar com Docker (recomendado)

- Docker Desktop instalado e em execução
- `docker compose` disponível no terminal
- Portas livres: `3306` (MySQL), `8080` (aplicação), `8081` (phpMyAdmin)

### Para rodar sem Docker (opcional)

- Java 17
- Maven 3.9+
- Node.js 18+ e npm
- MySQL 8 em execução

## 🚀 Guia prático de execução (Docker)

### 1. Ir para a raiz do projeto

```powershell
cd <CAMINHO_DO_PROJETO>/CAMPUSHOP
```

### 2. Subir serviços

```powershell
docker compose up -d --build
docker compose ps
```

### 3. Aplicar scripts SQL versionados

```powershell
docker cp .\db\scripts\001_schema.sql campushop-mysql:/tmp/001_schema.sql
docker compose exec mysql sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD < /tmp/001_schema.sql"

docker cp .\db\scripts\002_seed.sql campushop-mysql:/tmp/002_seed.sql
docker compose exec mysql sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD < /tmp/002_seed.sql"

docker cp .\db\scripts\003_validate.sql campushop-mysql:/tmp/003_validate.sql
docker compose exec mysql sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD < /tmp/003_validate.sql"
```

### 4. Acessar serviços

- Aplicação: `http://localhost:8080`
- phpMyAdmin: `http://localhost:8081`

No phpMyAdmin, use:

- Servidor: `mysql`
- Usuário: `root`
- Senha: valor de `MYSQL_ROOT_PASSWORD` definido no `docker-compose.yml`

> ⚠️ Segurança: as credenciais atuais são de ambiente local/desenvolvimento. Para qualquer ambiente compartilhado ou produção, altere usuário/senha e não versione segredos reais.

## ✅ Validação rápida

1. Confirmar estado dos containers:

```powershell
docker compose ps
```

2. Executar conferência básica no banco:

```powershell
docker compose exec mysql sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD -e \"USE campushop; SHOW TABLES; SELECT COUNT(*) AS usuarios FROM usuario; SELECT COUNT(*) AS produtos FROM produto;\""
```

3. Validar funcionalmente:

- abrir `http://localhost:8080`
- validar cadastro/login e listagem de produtos
- abrir `http://localhost:8081` (phpMyAdmin)

## ♻️ Rollback / Limpeza

Para remover estrutura e dados do banco:

1. Executar `db/scripts/999_rollback.sql` no MySQL
2. Opcional: remover volumes para reset total

```powershell
docker compose down -v
```

## 📦 Guia de execução sem Docker (opcional)

### 1. Backend

```powershell
mvn spring-boot:run
```

Backend/API: `http://localhost:8080`

### 2. Frontend (hot reload)

```powershell
cd frontend
npm install
npm run dev
```

Frontend (dev): `http://localhost:5173`

> Observação: no modo sem Docker, você precisa garantir que o banco MySQL local esteja configurado para as mesmas credenciais/propriedades esperadas pela aplicação.

## 📂 Estrutura essencial

- `src/main/java` → código backend
- `src/main/resources` → templates e arquivos estáticos servidos pelo Spring
- `frontend` → código-fonte React
- `db/scripts` → scripts SQL versionados
- `docker-compose.yml` → orquestração de app + banco

---

Projeto desenvolvido por **Caio, Jhonathas, Julia, Pedro e Mateus**.
