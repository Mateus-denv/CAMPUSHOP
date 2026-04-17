# PLANO DE TESTE  
## Sistema CampuShop


## 1. Escopo

Este plano de teste tem como finalidade validar o sistema CampuShop, garantindo que suas funcionalidades atendam aos requisitos definidos no projeto.

Serão testados os seguintes módulos:

- Autenticação de Usuário  
- Cadastro de Usuário  
- Cadastro de Produto  

Não fazem parte do escopo:

- Sistema de chat  
- Avaliações  
- Geolocalização  
- Testes de performance  
- Testes de carga  
- Testes de segurança avançada  
- Interface gráfica (caso exista frontend)  

Os testes serão realizados na API utilizando a ferramenta Postman.

---

## 2. Objetivo

Garantir que o sistema CampuShop:

- Atenda aos requisitos funcionais definidos  
- Trate corretamente entradas inválidas  
- Impeça ações indevidas  
- Mantenha integridade das informações  
- Apresente respostas adequadas (status HTTP e mensagens)  

O objetivo é assegurar a qualidade mínima do sistema antes da fase de execução prática dos testes.

---

## 3. Estratégia de Teste

A estratégia adotada será baseada em:

- Testes funcionais  
- Testes positivos (fluxos válidos)  
- Testes negativos (validações e erros esperados)  

Os testes serão planejados previamente e organizados em:

- Casos de Teste documentados  
- Matriz de Rastreabilidade  
- Versionamento no GitHub  

A ferramenta utilizada será o Postman para envio de requisições HTTP (GET, POST, PUT, DELETE).

Cada caso de teste conterá:

- ID  
- Módulo  
- Tipo  
- Pré-condição  
- Passos  
- Dados  
- Resultado esperado  

---

## 4. Ambiente de Teste

- Ferramenta de Teste: Postman  
- Repositório: GitHub  
- Ambiente: API local (localhost) ou servidor disponibilizado  
- Banco de Dados: Conforme configuração do sistema  
- Sistema Operacional: Windows  

---

## 5. Critérios de Entrada

Os testes poderão ser iniciados quando:

- A API estiver funcionando  
- Os endpoints de autenticação, cadastro de usuário e cadastro de produto estiverem disponíveis  
- O banco de dados estiver configurado  
- O ambiente estiver operacional  

---

## 6. Critérios de Saída

Os testes serão considerados concluídos quando:

- Todos os casos de teste forem executados  
- Houver cobertura de todos os módulos implementados  
- Houver no mínimo 10 casos de teste  
- Existirem no mínimo 4 cenários negativos  
- A matriz de rastreabilidade estiver completa  

---

## 7. Responsáveis

- **Júlia Conceição**: execução dos testes e registro dos resultados  
- **Equipe CampuShop**: criação e validação final do sistema  