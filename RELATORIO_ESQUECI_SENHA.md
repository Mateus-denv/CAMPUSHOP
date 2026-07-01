# Relatório de implementação — Funcionalidade "Esqueci minha senha"

## Objetivo
Implementar o fluxo completo de recuperação de senha no projeto CampusShop, incluindo backend, banco de dados, envio de e-mail e frontend.

## O que foi feito

### 1. Análise da estrutura do projeto
Foi verificada a organização existente do backend e do frontend para respeitar os padrões já adotados no projeto, incluindo:
- controllers de autenticação;
- modelos de usuário;
- repositórios e serviços;
- configuração de segurança com BCrypt;
- estrutura de DTOs;
- organização de páginas e rotas no React.

### 2. Implementação no backend
Foram adicionados os elementos abaixo:
- entidade para armazenar os tokens de redefinição de senha;
- repositório para buscar, salvar e remover tokens;
- serviço responsável por:
  - gerar um token UUID;
  - salvar o token com expiração de 30 minutos;
  - validar o token;
  - atualizar a senha com BCrypt;
  - remover o token após uso.

### 3. Envio de e-mail
Foi incluído o suporte a envio de e-mails utilizando Spring Mail, com:
- dependência adicionada no Maven;
- serviço de e-mail para enviar o link de redefinição;
- mensagem com o assunto "Redefinição de senha" e o link para a página do frontend.

### 4. Endpoints de autenticação
Foram criados os endpoints:
- POST /api/auth/esqueci-senha
- POST /api/auth/redefinir-senha

Esses endpoints retornam mensagens padronizadas e nunca revelam se o e-mail realmente existe.

### 5. Banco de dados
Foi adicionada uma migração para criar a tabela responsável por armazenar os tokens de redefinição, incluindo:
- identificador do token;
- token gerado;
- referência ao usuário;
- data de expiração;
- chave estrangeira para a tabela de usuários.

### 6. Implementação no frontend
Foram criadas as páginas:
- EsqueciSenhaPage
- RedefinirSenhaPage

Também foram adicionadas:
- rotas para /esqueci-senha e /redefinir-senha;
- link "Esqueci minha senha" na tela de login;
- validações de formulário no frontend para:
  - e-mail obrigatório;
  - senha mínima de 8 caracteres;
  - confirmação de senha igual à nova senha.

### 7. Ajustes de compatibilidade
Foram realizados pequenos ajustes para garantir que o projeto continuasse compilando corretamente, inclusive no roteamento do React e na configuração do Maven.

## Resultados
A funcionalidade de recuperação de senha ficou implementada de forma integrada entre backend, banco e frontend, permitindo:
1. o usuário informar o e-mail;
2. o sistema gerar e salvar um token;
3. o sistema enviar um link de redefinição;
4. o usuário acessar a tela de nova senha;
5. o sistema validar o token e atualizar a senha.

## Arquivos alterados e criados

### Backend
- Arquivos criados:
  - [src/main/java/br/com/campushop/campushop_backend/model/PasswordResetToken.java](src/main/java/br/com/campushop/campushop_backend/model/PasswordResetToken.java)
  - [src/main/java/br/com/campushop/campushop_backend/repository/PasswordResetTokenRepository.java](src/main/java/br/com/campushop/campushop_backend/repository/PasswordResetTokenRepository.java)
  - [src/main/java/br/com/campushop/campushop_backend/service/EmailService.java](src/main/java/br/com/campushop/campushop_backend/service/EmailService.java)
  - [src/main/java/br/com/campushop/campushop_backend/service/PasswordResetService.java](src/main/java/br/com/campushop/campushop_backend/service/PasswordResetService.java)
  - [src/main/java/br/com/campushop/campushop_backend/dto/PasswordResetRequest.java](src/main/java/br/com/campushop/campushop_backend/dto/PasswordResetRequest.java)
  - [src/main/java/br/com/campushop/campushop_backend/dto/RedefinirSenhaRequest.java](src/main/java/br/com/campushop/campushop_backend/dto/RedefinirSenhaRequest.java)
  - [src/main/resources/db/migration/V20260630__create_password_reset_tokens.sql](src/main/resources/db/migration/V20260630__create_password_reset_tokens.sql)
- Arquivos alterados:
  - [src/main/java/br/com/campushop/campushop_backend/controller/AuthController.java](src/main/java/br/com/campushop/campushop_backend/controller/AuthController.java)
  - [pom.xml](pom.xml)
  - [src/main/resources/application.properties](src/main/resources/application.properties)

### Frontend
- Arquivos criados:
  - [frontend/src/pages/EsqueciSenhaPage.tsx](frontend/src/pages/EsqueciSenhaPage.tsx)
  - [frontend/src/pages/RedefinirSenhaPage.tsx](frontend/src/pages/RedefinirSenhaPage.tsx)
- Arquivos alterados:
  - [frontend/src/App.tsx](frontend/src/App.tsx)
  - [frontend/src/lib/api-service.ts](frontend/src/lib/api-service.ts)
  - [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx)
  - [frontend/src/lib/auth-listener.ts](frontend/src/lib/auth-listener.ts)

## Validação
A implementação foi validada com:
- teste do backend para a lógica de redefinição de senha;
- build do frontend sem erros.
