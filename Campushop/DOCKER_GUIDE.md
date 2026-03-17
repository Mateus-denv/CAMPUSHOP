# 🐳 Guia Docker - CampuShop

## 📋 Pré-requisitos

### Instalar Docker Desktop

1. **Download Docker Desktop:**

   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Siga o instalador e reinicie o computador se necessário

2. **Verificar instalação:**
   ```powershell
   docker --version
   docker-compose --version
   ```

## 🚀 Como Rodar a Aplicação com Docker

### Opção 1: Usando o Script Automático (RECOMENDADO)

#### No PowerShell:

```powershell
.\run-docker.ps1
```

#### No CMD:

```cmd
run-docker.bat
```

O script vai mostrar um menu:

```
1. Iniciar aplicação (build + run)
2. Parar aplicação
3. Ver logs
4. Rebuild (reconstruir imagem)
```

### Opção 2: Comandos Manuais

#### Iniciar a aplicação:

```bash
docker-compose up -d
```

#### Ver logs:

```bash
docker-compose logs -f
```

#### Parar a aplicação:

```bash
docker-compose down
```

#### Reconstruir (após mudanças no código):

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🌐 Acessar a Aplicação

Após iniciar, acesse: **http://localhost:8080**

## 📦 O que o Docker faz?

1. **MySQL**: Cria um container com banco de dados MySQL 8.0
2. **App**: Compila e roda a aplicação Spring Boot em um container
3. **Rede**: Conecta os containers para comunicação interna
4. **Dados**: Persiste dados do MySQL em um volume

## 🎯 Para Apresentação em Outro PC

### Passo 1: Preparar arquivos

Copie toda a pasta do projeto para o outro PC (incluindo arquivos Docker)

### Passo 2: No PC da apresentação

```powershell
# 1. Abrir PowerShell na pasta do projeto
cd "caminho\para\CampuShop"

# 2. Rodar script
.\run-docker.ps1

# 3. Escolher opção 1 (Iniciar aplicação)
```

### Passo 3: Aguardar

- Primeira vez: ~5-10 minutos (baixa imagens e compila)
- Próximas vezes: ~30 segundos

### Passo 4: Acessar

Abrir navegador: http://localhost:8080

## 🔧 Solução de Problemas

### Erro: "Docker não está rodando"

- Abra o Docker Desktop e aguarde iniciar
- Veja o ícone da baleia na bandeja do sistema

### Erro: "Porta 8080 já em uso"

```powershell
# Windows - Encontrar e matar processo na porta 8080
netstat -ano | findstr :8080
taskkill /PID <numero_do_pid> /F
```

### Erro: "Porta 3306 já em uso" (MySQL local rodando)

```powershell
# Parar MySQL local
Stop-Service MySQL80

# Ou editar docker-compose.yml e mudar porta:
# ports:
#   - "3307:3306"  # Usa 3307 no host
```

### Limpar tudo e recomeçar:

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## 📊 Comandos Úteis

```bash
# Ver containers rodando
docker ps

# Ver logs do app
docker-compose logs -f app

# Ver logs do MySQL
docker-compose logs -f mysql

# Entrar no container do app
docker exec -it campushop-app bash

# Entrar no MySQL
docker exec -it campushop-mysql mysql -u root -p123456

# Ver uso de recursos
docker stats

# Parar tudo
docker-compose down

# Parar e remover volumes (limpa banco)
docker-compose down -v
```

## 🎁 Vantagens do Docker

✅ **Portabilidade**: Roda em qualquer PC com Docker  
✅ **Isolamento**: Não interfere com outras instalações  
✅ **Consistência**: Mesmo ambiente em desenvolvimento e apresentação  
✅ **Rapidez**: Inicia em segundos após primeira build  
✅ **Limpeza**: Remove tudo com um comando

## 📝 Estrutura de Arquivos Docker

```
CampuShop/
├── Dockerfile              # Como construir a imagem da app
├── docker-compose.yml      # Orquestração (app + MySQL)
├── .dockerignore          # Arquivos ignorados no build
├── run-docker.ps1         # Script PowerShell
└── run-docker.bat         # Script CMD
```

## ⚡ Dicas para Apresentação

1. **Teste antes**: Rode pelo menos uma vez no PC da apresentação
2. **Dados de teste**: Crie usuários e produtos antes da apresentação
3. **Backup**: Tenha o código em um pendrive/nuvem
4. **Internet**: Primeira execução precisa de internet (baixar imagens)
5. **Performance**: Docker Desktop deve estar rodando antes

---

**Boa apresentação! 🚀**
