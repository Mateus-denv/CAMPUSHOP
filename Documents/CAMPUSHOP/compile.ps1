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
$JAVA_HOME_LOCAL = Join-Path $ScriptDir "oracleJdk-25"
$M2_HOME = Join-Path $ScriptDir "apache-maven-3.9.6"
$mvnPath = Join-Path $M2_HOME "bin\mvn.cmd"
$mavenBootJar = Get-ChildItem -Path (Join-Path $M2_HOME "boot") -Filter "plexus-classworlds-*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1

Write-Host ""
Write-Host "==========================================="
Write-Host "   CampuShop - Build Script"
Write-Host "==========================================="
Write-Host ""

$useLocalMaven = (Test-Path $mvnPath) -and ($null -ne $mavenBootJar)

if ($useLocalMaven) {
    if (Test-Path (Join-Path $JAVA_HOME_LOCAL "bin\java.exe")) {
        $env:JAVA_HOME = $JAVA_HOME_LOCAL
        $env:PATH = "$JAVA_HOME_LOCAL\bin;$env:PATH"
    }

    $env:M2_HOME = $M2_HOME
    $env:PATH = "$M2_HOME\bin;$env:PATH"

    Write-Host "Modo: Maven local" -ForegroundColor Cyan
    java -version 2>&1
    Write-Host ""
    & $mvnPath -v 2>&1 | Select-Object -First 2
    Write-Host ""

    if ($MavenArgs.Count -eq 0) {
        Write-Host "Compilando projeto (clean install)..." -ForegroundColor Green
        & $mvnPath clean install
    } else {
        $argsString = $MavenArgs -join " "
        Write-Host "Executando: mvn $argsString" -ForegroundColor Green
        & $mvnPath @MavenArgs
    }
} else {
    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if ($null -eq $dockerCmd) {
        Write-Host "Erro: Maven local está incompleto e Docker não foi encontrado." -ForegroundColor Red
        Write-Host "Instale Docker Desktop ou Maven completo no PATH." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Modo: Docker (Maven local indisponível/incompleto)" -ForegroundColor Yellow
    $dockerArgs = @(
        "run", "--rm",
        "-v", "${ScriptDir}:/workspace",
        "-w", "/workspace",
        "maven:3.9.6-eclipse-temurin-17",
        "mvn"
    )

    if ($MavenArgs.Count -eq 0) {
        Write-Host "Compilando projeto (clean install) via Docker..." -ForegroundColor Green
        $dockerArgs += @("clean", "install")
    } else {
        $argsString = $MavenArgs -join " "
        Write-Host "Executando via Docker: mvn $argsString" -ForegroundColor Green
        $dockerArgs += $MavenArgs
    }

    & docker @dockerArgs
}
