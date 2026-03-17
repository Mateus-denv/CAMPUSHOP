# 📋 SOLUÇÃO DOS PROBLEMAS DE COMPILAÇÃO - CampuShop

## 🔴 Problemas Encontrados

1. **Java versão errada (Java 8 instalado, mas Java 17+ necessário)**

   - O projeto requer Java 17 (definido no `pom.xml`)
   - Spring Boot 3.1.5 requer Java 17+
   - Jakarta Persistence requer Java 17+

2. **Maven não instalado no PATH**

   - O comando `mvn` não era reconhecido pelo sistema
   - Maven é necessário para compilar o projeto

3. **Java Oracle JDK 25 estava disponível mas não configurado**
   - A pasta `oracleJdk-25/` estava no projeto mas não sendo usada

## ✅ SOLUÇÃO IMPLEMENTADA

### O que foi feito:

1. ✔️ Baixado Apache Maven 3.9.6 na pasta do projeto
2. ✔️ Configurado para usar Oracle JDK 25 (que está na pasta `oracleJdk-25/`)
3. ✔️ Criados scripts de compilação automática

### 📁 Arquivos Criados:

- **`compile.bat`** - Script para Windows (CMD)
- **`compile.ps1`** - Script para Windows (PowerShell)
- **`COMPILATION_ISSUES.md`** - Este arquivo

## 🚀 COMO COMPILAR O PROJETO

### Opção 1: Usando PowerShell (Recomendado)

```powershell
# Navegar até o diretório do projeto
cd "c:\Users\pedro\Downloads\CampuShop (1)\CampuShop"

# Executar a compilação padrão (clean install)
.\compile.ps1

# Ou executar comandos específicos:
.\compile.ps1 clean
.\compile.ps1 package
.\compile.ps1 spring-boot:run        # Para executar a aplicação
.\compile.ps1 spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"  # Debug
```

### Opção 2: Usando CMD (Prompt de Comando)

```cmd
cd "c:\Users\pedro\Downloads\CampuShop (1)\CampuShop"
compile.bat
```

### Opção 3: Manualmente (PowerShell)

```powershell
cd "c:\Users\pedro\Downloads\CampuShop (1)\CampuShop"

$env:JAVA_HOME = "$(Get-Location)\oracleJdk-25"
$env:M2_HOME = "$(Get-Location)\apache-maven-3.9.6"
$env:PATH = "$env:M2_HOME\bin;$env:JAVA_HOME\bin;$env:PATH"

mvn clean install
```

## 📦 Estrutura do Projeto Após Solução

```
CampuShop/
├── oracleJdk-25/              ← Java 25 (estava no projeto)
├── apache-maven-3.9.6/        ← Maven (foi adicionado)
├── compile.bat                ← Script de compilação (novo)
├── compile.ps1                ← Script PowerShell (novo)
├── pom.xml                    ← Configuração Maven
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
├── target/                    ← Será criado após compilação
└── ...
```

## 🧪 Testando a Compilação

Após executar `compile.ps1` ou `compile.bat`, você verá:

1. ✔ Verificação de versão do Java e Maven
2. ✔ Limpeza de arquivos anteriores (`clean`)
3. ✔ Compilação do código
4. ✔ Execução de testes
5. ✔ Empacotamento da aplicação

Se tudo der certo, você verá:

```
BUILD SUCCESS
```

## 🛠️ Comandos Úteis

```powershell
# Compilar sem testes
.\compile.ps1 clean compile

# Rodar apenas os testes
.\compile.ps1 test

# Empacotar a aplicação (gera .jar)
.\compile.ps1 package

# Executar a aplicação Spring Boot
.\compile.ps1 spring-boot:run

# Executar em modo Debug
.\compile.ps1 spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"

# Limpar arquivos gerados
.\compile.ps1 clean

# Ver dependências
.\compile.ps1 dependency:tree
```

## 📋 Configuração no VS Code (Tasks)

Os scripts de compilação também estão disponíveis como tasks do VS Code:

- `Maven: Clean`
- `Maven: Install`
- `Maven: Package`
- `Maven: Test`
- `Spring Boot: Run`
- `Spring Boot: Run (Debug)`

## 🔧 Ambiente

- **Java**: Oracle JDK 25.0.1
- **Maven**: 3.9.6
- **Spring Boot**: 3.1.5
- **Sistema**: Windows 10+

## ❌ Se ainda não funcionar:

1. Verifique se o Java Oracle JDK 25 está na pasta `oracleJdk-25/`
2. Verifique se o Maven está na pasta `apache-maven-3.9.6/`
3. Tente limpar o cache Maven: `.\compile.ps1 clean`
4. Verifique a conexão de internet (necessária para baixar dependências)
5. Verifique se o MySQL está rodando (se precisar testar a conexão de banco)

## 📝 Notas

- O projeto estava bloqueado por falta de Java 17+ e Maven
- A solução utiliza os componentes locais que já estavam no projeto
- Os scripts automatizam a configuração de variáveis de ambiente
- As dependências Maven serão baixadas automaticamente na primeira execução

---

**Problema Resolvido!** 🎉

Você agora pode compilar e executar o projeto CampuShop normalmente.
