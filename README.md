<div align="center">
  <img src="./Campushop/campuShopcapa.png" width="50%" height="auto">
</div>

# CampuShop - Seu Marketplace Estudantil

O CampusShop é uma plataforma de marketplace desenvolvida para conectar estudantes, permitindo a compra e venda de produtos de forma segura e conveniente dentro da comunidade acadêmici       1a.

## Visão Geral do Projeto

Este projeto consiste em uma aplicação web construída com **Spring Boot** para o backend e **Thymeleaf** com HTML, CSS e JavaScript para o frontend. O objetivo é criar um ambiente onde os estudantes possam anunciar produtos, encontrar o que precisam e interagir de forma segura.

## Funcionalidades Implementadas

- **Backend**:
  - API RESTful com Spring Boot.
  - Persistência de dados com Spring Data JPA e H2 (banco de dados em memória).
  - Sistema de segurança com **Spring Security** para autenticação.
  - **Criptografia de senhas** utilizando BCrypt.
- **Frontend**:
  - Interface moderna e responsiva criada com HTML5, CSS3 e JavaScript.
  - Templates dinâmicos com Thymeleaf.
  - Páginas de Login, Cadastro e Home.

## Como Executar o Projeto

Existem **duas formas** de executar o projeto: com Docker (recomendado para apresentações) ou localmente com Maven.

---

## 🐳 OPÇÃO 1: Com Docker (RECOMENDADO)

### Ideal para:

✅ Apresentações em outros PCs  
✅ Não ter que instalar Java/Maven/MySQL  
✅ Ambiente isolado e consistente

### Pré-requisitos:

- **Docker Desktop** instalado: https://www.docker.com/products/docker-desktop

### Como usar:

**PowerShell:**

```powershell
.\run-docker.ps1
# Escolha opção 1 (Iniciar aplicação)
```

**CMD:**

```cmd
run-docker.bat
```

**Acesse:** http://localhost:8080

📖 **Guia completo:** Veja [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

---

## 💻 OPÇÃO 2: Execução Local (Maven)

### Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes softwares instalados e configurados no seu ambiente:

- **Java (JDK 17 ou superior)**:

  - Para verificar se o Java está instalado, abra um terminal (Prompt de Comando, PowerShell, etc.) e execute:
    ```sh
    java -version
    ```
  - Você deve ver uma saída informando a versão do Java. Se o comando não for encontrado, você precisará [instalar o JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html).

- **Apache Maven (3.x ou superior)**:
  - Para verificar se o Maven está instalado, execute no terminal:
    ```sh
    mvn -version
    ```
  - Se o comando não for encontrado, você precisará [instalar o Maven](https://maven.apache.org/install.html) e adicioná-lo ao `PATH` do seu sistema.

### 2. Obtendo o Código

- **Clone o repositório** para a sua máquina local:
  ```bash
  git clone https://github.com/JhonathasDev/CampuShop.git
  ```
- **Navegue até o diretório** do projeto:
  ```bash
  cd CampuShop
  ```

### 3. Compilando e Executando a Aplicação

**Usando scripts automáticos (recomendado):**

```powershell
.\compile.ps1 spring-boot:run
```

**Ou manualmente:**

```bash
mvn spring-boot:run
```

- **O que este comando faz?**

  1.  O Maven irá baixar todas as dependências do projeto listadas no arquivo `pom.xml`. Isso pode levar alguns minutos na primeira vez.
  2.  Em seguida, ele compilará todo o código-fonte Java.
  3.  Por fim, ele iniciará o servidor web embutido (Tomcat).

- **Aguarde o servidor iniciar**. Você saberá que o projeto está rodando quando vir mensagens no terminal parecidas com esta:
  ```
  ...
  ...  Tomcat started on port(s): 8080 (http) with context path ''
  ...  Started CampushopBackendApplication in X.XXX seconds (JVM running for Y.YYY)
  ```

### 4. Acesse a Aplicação

- Após o servidor iniciar com sucesso, abra seu navegador de internet.
- Acesse a seguinte URL: `http://localhost:8080`

### 5. Parando a Aplicação

- Para desligar o servidor, volte ao terminal onde ele está rodando e pressione `Ctrl + C`.

## Estrutura do Projeto

```
/
├── src/
│   ├── main/
│   │   ├── java/br/com/campushop/campushop_backend/
│   │   │   ├── config/         # Configurações de segurança
│   │   │   ├── controller/     # Controladores web
│   │   │   ├── model/          # Entidades JPA
│   │   │   ├── repository/     # Repositórios Spring Data
│   │   │   └── service/        # Lógica de negócio
│   │   └── resources/
│   │       ├── static/         # Arquivos CSS, JS e imagens
│   │       └── templates/      # Templates HTML (Thymeleaf)
│   └── test/                   # Testes unitários
├── pom.xml                     # Dependências e build do Maven
└── README.md                   # Este arquivo
```

---

Projeto desenvolvido por **Caio, Jhonathas, Julia, Pedro e Mateus**.
