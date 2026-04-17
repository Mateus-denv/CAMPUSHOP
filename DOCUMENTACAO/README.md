# 📚 DOCUMENTAÇÃO DO CAMPUSHOP

**Documentação completa do projeto CampusShop** - Um e-commerce full-stack para comunidade acadêmica.

Criado em: Abril 2026 | Versão: 1.0 | Status: ✅ Completo

## 📋 Índice Rápido

- [🎯 Para Começar](#-para-começar)
- [🏠 Visão Geral](#-visão-geral)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔧 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🏗️ Arquitetura](#-arquitetura)
- [📚 Documentação Organizada](#-documentação-organizada)
- [🚀 Como Usar Esta Documentação](#-como-usar-esta-documentação)

---

## 🎯 Para Começar

### Novo no projeto?

1. **Leia primeiro:** [🏠 Visão Geral](#-visão-geral)
2. **Entenda a arquitetura:** [🏗️ Estrutura](#-estrutura-do-projeto)
3. **Escolha seu módulo:**
   - Trabalhando no backend? → [📁 BACKEND/](./BACKEND)
   - Trabalhando no frontend? → [📁 FRONTEND/](./FRONTEND)
   - Trabalhando com banco? → [📁 DATABASE/](./DATABASE)

### Procurando algo específico?

- **Dúvida sobre API REST?** → Veja [BACKEND/02_CONTROLLERS.md](./BACKEND/02_CONTROLLERS.md)
- **Dúvida sobre componentes React?** → Veja [FRONTEND/02_COMPONENTS.md](./FRONTEND/02_COMPONENTS.md)
- **Dúvida sobre banco de dados?** → Veja [DATABASE/01_SCHEMA.md](./DATABASE/01_SCHEMA.md)
- **Dúvida sobre roteamento?** → Veja [FRONTEND/05_ROUTING.md](./FRONTEND/05_ROUTING.md)

---

**CampusShop** é uma plataforma de e-commerce desenvolvida para comunidades acadêmicas (campus universitários). O sistema permite que usuários cadastrados possam:

- ✅ Se registrar e fazer login na plataforma
- ✅ Visualizar produtos disponíveis em diferentes categorias
- ✅ Adicionar produtos ao carrinho de compras
- ✅ Realizar pedidos
- ✅ Criar/vender seus próprios produtos
- ✅ Gerenciar sua conta e pedidos
- ✅ Interagir via chat

**Stack Tecnológico:**
- **Backend:** Java 17 + Spring Boot 3.1.5
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Banco de Dados:** MySQL
- **Autenticação:** JWT (JSON Web Tokens)
- **Build:** Maven
- **Containerização:** Docker + Docker Compose

---

## 📁 Estrutura do Projeto

```
CAMPUSHOP/
├── src/                          # Código-fonte do Backend (Java)
│   ├── main/
│   │   ├── java/br/com/campushop/campushop_backend/
│   │   │   ├── controller/       # Controladores REST
│   │   │   ├── service/          # Lógica de negócio
│   │   │   ├── model/            # Modelos de dados (Entidades JPA)
│   │   │   ├── repository/       # Camada de acesso a dados
│   │   │   ├── dto/              # Objetos de transferência de dados
│   │   │   ├── security/         # Configuração de segurança e JWT
│   │   │   ├── config/           # Configurações gerais
│   │   │   ├── validation/       # Validadores customizados
│   │   │   └── CampushopBackendApplication.java  # Classe principal
│   │   └── resources/
│   │       └── application.properties  # Configurações da aplicação
│   └── test/                     # Testes unitários
│
├── frontend/                      # Código-fonte do Frontend (React)
│   ├── src/
│   │   ├── pages/                # Páginas da aplicação
│   │   ├── components/           # Componentes React
│   │   ├── lib/                  # Bibliotecas e utilitários
│   │   ├── App.tsx               # Componente principal
│   │   ├── main.tsx              # Ponto de entrada
│   │   └── store.ts              # Gerenciamento de estado (Zustand)
│   ├── package.json              # Dependências do npm
│   ├── tsconfig.json             # Configuração TypeScript
│   └── vite.config.ts            # Configuração Vite
│
├── db/                           # Scripts do banco de dados
│   └── scripts/
│       ├── 001_schema.sql        # Criação das tabelas
│       ├── 002_seed.sql          # Dados iniciais
│       └── 003_validate.sql      # Scripts de validação
│
├── docker-compose.yml            # Orquestração de containers
├── Dockerfile                    # Imagem Docker da aplicação
├── pom.xml                       # Configuração Maven
└── DOCUMENTACAO/                 # 📚 Documentação do projeto (este diretório)
```

---

## 🔧 Tecnologias Utilizadas

### Backend
- **Spring Boot 3.1.5** - Framework web e microserviços
- **Spring Data JPA** - Persistência de dados
- **Spring Security** - Autenticação e autorização
- **JWT (jjwt)** - Token de autenticação segura
- **MySQL Connector/J** - Driver MySQL
- **Maven** - Gerenciador de dependências e build
- **Java 17** - Linguagem de programação

### Frontend
- **React 18** - Biblioteca JavaScript para UIs
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento de páginas
- **Zustand** - Gerenciamento de estado simples
- **Axios** - Cliente HTTP

### Infraestrutura
- **MySQL 8** - Banco de dados relacional
- **Docker** - Containerização
- **Docker Compose** - Orquestração local

---

## 🏗️ Arquitetura

### Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│        FRONTEND (React + TS)            │
│  - Pages (Páginas da aplicação)         │
│  - Components (Componentes reutilizáveis)│
│  - Store (Gerenciamento de estado)      │
└────────────────┬────────────────────────┘
                 │ (HTTP/REST API)
                 ▼
┌─────────────────────────────────────────┐
│    BACKEND (Spring Boot - Java)         │
├─────────────────────────────────────────┤
│  Controllers (REST Endpoints)           │  ◄─── Recebem requisições
├─────────────────────────────────────────┤
│  Services (Lógica de Negócio)           │  ◄─── Processam dados
├─────────────────────────────────────────┤
│  Repositories (Acesso a Dados)          │  ◄─── Consultam BD
├─────────────────────────────────────────┤
│  Security (JWT + Spring Security)       │  ◄─── Autenticação
└────────────────┬────────────────────────┘
                 │ (JDBC/JPA)
                 ▼
┌─────────────────────────────────────────┐
│      DATABASE (MySQL)                   │
│  - Tabelas de Usuários                  │
│  - Tabelas de Produtos                  │
│  - Tabelas de Carrinho/Pedidos           │
│  - Tabelas de Categorias                │
└─────────────────────────────────────────┘
```

### Fluxo de Autenticação

```
1. Usuário faz login
   └─> POST /api/auth/login (email, senha)

2. Backend valida credenciais
   └─> UsuarioService.autenticar()
   
3. Se válido, gera JWT token
   └─> JwtTokenProvider.generateToken()

4. Token retorna ao Frontend
   └─> LocalStorage.setItem('token')

5. Todas as requisições posteriores incluem token
   └─> Header: Authorization: Bearer <token>

6. JwtAuthenticationFilter valida token em cada requisição
   └─> Se inválido, retorna 401 Unauthorized
```

---

## � Documentação Organizada

A documentação está organizada em **3 módulos principais** com um total de **15 arquivos detalhados**.

### 📁 Backend (src/main/java/br/com/campushop/campushop_backend/)

Tudo sobre a API REST, lógica de negócio e integração com banco de dados.

| Arquivo | Sobre | Para Quem |
|---------|-------|----------|
| [01_MODELS.md](./BACKEND/01_MODELS.md) | **Entidades JPA** (Usuario, Produto, Categoria, Carrinho, etc.) | Backend devs, DBAs |
| [02_CONTROLLERS.md](./BACKEND/02_CONTROLLERS.md) | **Endpoints REST** (8 controllers, 40+ endpoints) | API consumers, frontend devs |
| [03_SERVICES.md](./BACKEND/03_SERVICES.md) | **Lógica de negócio** (4 services) | Backend devs |
| [04_REPOSITORIES.md](./BACKEND/04_REPOSITORIES.md) | **Acesso a dados** (Spring Data JPA, queries) | Backend devs, DBAs |
| [05_SECURITY.md](./BACKEND/05_SECURITY.md) | **Autenticação & Autorização** (JWT, BCrypt, Spring Security) | Security engineers |
| [06_CONFIG.md](./BACKEND/06_CONFIG.md) | **Configuração** (properties, beans, seeders) | Devops, backend devs |

### 📁 Frontend (frontend/src/)

Tudo sobre UI, componentes, roteamento e estado global.

| Arquivo | Sobre | Para Quem |
|---------|-------|----------|
| [01_PAGES.md](./FRONTEND/01_PAGES.md) | **11 Páginas** (Home, Login, Produtos, Carrinho, Pedidos, etc.) | Frontend devs, UX/UI |
| [02_COMPONENTS.md](./FRONTEND/02_COMPONENTS.md) | **Componentes Reutilizáveis** (Button, Card, Input, Modal, etc.) | Frontend devs |
| [03_LIB_SERVICES.md](./FRONTEND/03_LIB_SERVICES.md) | **Serviços de API** (Axios, interceptores, métodos) | Frontend devs |
| [04_STORE.md](./FRONTEND/04_STORE.md) | **Estado Global** (Zustand, auth, carrinho) | Frontend devs |
| [05_ROUTING.md](./FRONTEND/05_ROUTING.md) | **Navegação** (React Router v6, protected routes) | Frontend devs |

### 📁 Database (db/scripts/)

Tudo sobre estrutura, relacionamentos e queries SQL.

| Arquivo | Sobre | Para Quem |
|---------|-------|----------|
| [01_SCHEMA.md](./DATABASE/01_SCHEMA.md) | **Tabelas e Campos** (7 tabelas, índices, constraints) | DBAs, backend devs |
| [02_RELATIONSHIPS.md](./DATABASE/02_RELATIONSHIPS.md) | **Fluxo de Dados** (diagramas, relacionamentos 1:1/1:M) | Arquitetos, backend devs |
| [03_QUERIES.md](./DATABASE/03_QUERIES.md) | **Queries SQL Prontas** (50+ exemplos de SELECT/INSERT) | DBAs, analytics |
| [README.md](./DATABASE/README.md) | **Índice Database** | Todos |

---

## 🚀 Como Usar Esta Documentação

### Fluxo recomendado:

1. **Estudar** → Comece com este README.md (você está aqui!)
2. **Explorar** → Navegue pelos módulos usando os links acima
3. **Aprofundar** → Leia os arquivos específicos da sua área
4. **Implementar** → Use como referência enquanto desenvolve
5. **Contribuir** → Atualize a documentação conforme adiciona features

### Estrutura geral do projeto:

```
CAMPUSHOP/
├── DOCUMENTACAO/                 # 📍 VOCÊ ESTÁ AQUI
│   ├── README.md                # Este arquivo (visão geral)
│   ├── BACKEND/                 # 6 docs sobre Java/Spring
│   │   ├── 01_MODELS.md
│   │   ├── 02_CONTROLLERS.md
│   │   ├── 03_SERVICES.md
│   │   ├── 04_REPOSITORIES.md
│   │   ├── 05_SECURITY.md
│   │   └── 06_CONFIG.md
│   ├── FRONTEND/                # 5 docs sobre React/TypeScript
│   │   ├── 01_PAGES.md
│   │   ├── 02_COMPONENTS.md
│   │   ├── 03_LIB_SERVICES.md
│   │   ├── 04_STORE.md
│   │   └── 05_ROUTING.md
│   └── DATABASE/                # 4 docs sobre MySQL
│       ├── 01_SCHEMA.md
│       ├── 02_RELATIONSHIPS.md
│       ├── 03_QUERIES.md
│       └── README.md
├── frontend/                    # React app
├── src/main/java/...            # Spring Boot app
├── db/scripts/                  # SQL scripts
└── docker-compose.yml           # Orquestração
```

---

## ✅ Status da Documentação

| Módulo | Status | Cobertura |
|--------|--------|-----------|
| Backend | ✅ Completo | 100% (8 controllers, 4 services, 7 models) |
| Frontend | ✅ Completo | 100% (11 páginas, 10+ componentes) |
| Database | ✅ Completo | 100% (7 tabelas, 50+ queries) |
| **Total** | **✅ Completo** | **15 arquivos, 5.000+ linhas** |

---

## 📊 Estatísticas

### Arquivos de Documentação

```
15 arquivos markdown
├── Backend: 6 arquivos
├── Frontend: 5 arquivos
├── Database: 4 arquivos
└── Total: ~5.000+ linhas de documentação
```

### Cobertura de Código

```
Backend (Java):
  ✓ 8 Controllers documentados
  ✓ 4 Services documentados
  ✓ 4 Repositories documentados
  ✓ 7 Models documentados
  ✓ 5 Security/Config classes

Frontend (TypeScript/React):
  ✓ 11 Pages documentadas
  ✓ 10+ Components documentados
  ✓ 5 Services documentados
  ✓ 2 Stores (Zustand)
  ✓ React Router v6

Database (MySQL):
  ✓ 7 Tabelas estruturadas
  ✓ 50+ Query examples
  ✓ ER diagrams
  ✓ Relacionamentos explicados
```

---

## 🔗 Links Importantes

### Documentação por Papel

**👨‍💻 Desenvolvedor Full-Stack**
- Comece aqui: [Visão Geral](#-visão-geral)
- Backend: [BACKEND/README.md](./BACKEND/README.md)
- Frontend: [FRONTEND/README.md](./FRONTEND/README.md)
- Database: [DATABASE/README.md](./DATABASE/README.md)

**🔙 Backend Developer**
- [BACKEND/02_CONTROLLERS.md](./BACKEND/02_CONTROLLERS.md) - Endpoints
- [BACKEND/03_SERVICES.md](./BACKEND/03_SERVICES.md) - Lógica
- [BACKEND/04_REPOSITORIES.md](./BACKEND/04_REPOSITORIES.md) - Dados
- [DATABASE/03_QUERIES.md](./DATABASE/03_QUERIES.md) - SQL

**🎨 Frontend Developer**
- [FRONTEND/01_PAGES.md](./FRONTEND/01_PAGES.md) - Páginas
- [FRONTEND/02_COMPONENTS.md](./FRONTEND/02_COMPONENTS.md) - Componentes
- [FRONTEND/05_ROUTING.md](./FRONTEND/05_ROUTING.md) - Navegação
- [FRONTEND/04_STORE.md](./FRONTEND/04_STORE.md) - Estado

**🗄️ Database Administrator**
- [DATABASE/01_SCHEMA.md](./DATABASE/01_SCHEMA.md) - Estrutura
- [DATABASE/02_RELATIONSHIPS.md](./DATABASE/02_RELATIONSHIPS.md) - Fluxos
- [DATABASE/03_QUERIES.md](./DATABASE/03_QUERIES.md) - SQL

---

## 📞 Suporte & Troubleshooting

### Problemas Comuns

**Dúvida: "Como crio um novo endpoint?"**
→ Veja [BACKEND/02_CONTROLLERS.md](./BACKEND/02_CONTROLLERS.md) + [BACKEND/03_SERVICES.md](./BACKEND/03_SERVICES.md)

**Dúvida: "Como adiciono um novo campo no produto?"**
→ Veja [DATABASE/01_SCHEMA.md](./DATABASE/01_SCHEMA.md) + [BACKEND/01_MODELS.md](./BACKEND/01_MODELS.md)

**Dúvida: "Como roto o estado entre componentes?"**
→ Veja [FRONTEND/04_STORE.md](./FRONTEND/04_STORE.md)

**Dúvida: "Qual query usar para X?"**
→ Veja [DATABASE/03_QUERIES.md](./DATABASE/03_QUERIES.md)

---

## 🤝 Contribuindo com Documentação

Ao adicionar novas funcionalidades, atualize a documentação:

1. **Nova classe Java?** → Adicione em [BACKEND/](./BACKEND/) correspondente
2. **Novo componente React?** → Adicione em [FRONTEND/02_COMPONENTS.md](./FRONTEND/02_COMPONENTS.md)
3. **Nova tabela/coluna?** → Atualize [DATABASE/01_SCHEMA.md](./DATABASE/01_SCHEMA.md)
4. **Novo endpoint?** → Adicione em [BACKEND/02_CONTROLLERS.md](./BACKEND/02_CONTROLLERS.md)

---

## 📝 Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-04-17 | 1.0 | ✅ Documentação completa criada |
| | | - 6 docs Backend (models, controllers, services, repos, security, config) |
| | | - 5 docs Frontend (pages, components, services, store, routing) |
| | | - 4 docs Database (schema, relationships, queries, README) |

---

## 📜 Licença

Este projeto é licenciado sob MIT License. Veja [LICENSE](../LICENSE) para detalhes.

---

**Última atualização:** Abril 2026  
**Status:** ✅ Documentação Completa  
**Versão:** 1.0  
**Mantido por:** Equipe CampusShop
