# Script para compilar o projeto CampuShop
# Uso: .\compile.ps1 [maven-commands]
# Exemplo: .\compile.ps1 clean install
#          .\compile.ps1 spring-boot:run

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$MavenArgs
)

# Configurar variáveis
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$JAVA_HOME = Join-Path $ScriptDir "oracleJdk-25"
$M2_HOME = Join-Path $ScriptDir "apache-maven-3.9.6"

# Verificar se Java está disponível
$javaPath = Join-Path $JAVA_HOME "bin\java.exe"
if (-not (Test-Path $javaPath)) {
    Write-Host "Erro: Java não encontrado em $JAVA_HOME" -ForegroundColor Red
    Write-Host "Certifique-se de que a pasta oracleJdk-25 está presente" -ForegroundColor Yellow
    exit 1
}

# Verificar se Maven está disponível
$mvnPath = Join-Path $M2_HOME "bin\mvn.cmd"
if (-not (Test-Path $mvnPath)) {
    Write-Host "Erro: Maven não encontrado em $M2_HOME" -ForegroundColor Red
    Write-Host "Certifique-se de que a pasta apache-maven-3.9.6 está presente" -ForegroundColor Yellow
    exit 1
}

# Configurar PATH
$env:PATH = "$M2_HOME\bin;$JAVA_HOME\bin;$env:PATH"
$env:JAVA_HOME = $JAVA_HOME
$env:M2_HOME = $M2_HOME

# Exibir versões
Write-Host ""
Write-Host "==========================================="
Write-Host "   CampuShop - Build Script"
Write-Host "==========================================="
Write-Host ""
Write-Host "Java:" -ForegroundColor Cyan
java -version 2>&1
Write-Host ""
Write-Host "Maven:" -ForegroundColor Cyan
mvn -v 2>&1 | Select-Object -First 1
Write-Host ""

# Se nenhum argumento foi passado, usar clean install como padrão
if ($MavenArgs.Count -eq 0) {
    Write-Host "Compilando projeto (clean install)..." -ForegroundColor Green
    mvn clean install
} else {
    $argsString = $MavenArgs -join " "
    Write-Host "Executando: mvn $argsString" -ForegroundColor Green
    mvn $MavenArgs
}
