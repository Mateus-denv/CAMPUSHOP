@echo off
REM Script para compilar o projeto CampuShop
REM Este script configura automaticamente Java e Maven

setlocal enabledelayedexpansion

REM Obter o caminho do diretório do script
set SCRIPT_DIR=%~dp0
set JAVA_HOME=%SCRIPT_DIR%oracleJdk-25
set M2_HOME=%SCRIPT_DIR%apache-maven-3.9.6
set MVN_CMD=%M2_HOME%\bin\mvn.cmd
set MAVEN_LOCAL_OK=0

if exist "%MVN_CMD%" (
    dir /b "%M2_HOME%\boot\plexus-classworlds-*.jar" >nul 2>&1
    if not errorlevel 1 (
        set MAVEN_LOCAL_OK=1
    )
)

REM Exibir versões
echo.
echo ===========================================
echo   CampuShop - Build Script
echo ===========================================
echo.

if "%MAVEN_LOCAL_OK%"=="1" (
    if exist "%JAVA_HOME%\bin\java.exe" (
        set PATH=%JAVA_HOME%\bin;%PATH%
        set JAVA_HOME=%JAVA_HOME%
    )
    set PATH=%M2_HOME%\bin;%PATH%
    set M2_HOME=%M2_HOME%

    echo Modo: Maven local
    echo Java:
    java -version
    echo.
    echo Maven:
    "%MVN_CMD%" -v
    echo.

    if "%1"=="" (
        echo Compilando projeto (clean install)...
        "%MVN_CMD%" clean install
    ) else (
        echo Executando: mvn %*
        "%MVN_CMD%" %*
    )
) else (
    where docker >nul 2>&1
    if errorlevel 1 (
        echo Erro: Maven local incompleto e Docker nao encontrado.
        echo Instale Docker Desktop ou Maven completo no PATH.
        exit /b 1
    )

    echo Modo: Docker (Maven local indisponivel/incompleto)
    if "%1"=="" (
        echo Compilando projeto (clean install) via Docker...
        docker run --rm -v "%SCRIPT_DIR:~0,-1%:/workspace" -w /workspace maven:3.9.6-eclipse-temurin-17 mvn clean install
    ) else (
        echo Executando via Docker: mvn %*
        docker run --rm -v "%SCRIPT_DIR:~0,-1%:/workspace" -w /workspace maven:3.9.6-eclipse-temurin-17 mvn %*
    )
)

endlocal
pause
