@echo off
REM Script para compilar o projeto CampuShop
REM Este script configura automaticamente Java e Maven

setlocal enabledelayedexpansion

REM Obter o caminho do diretório do script
set SCRIPT_DIR=%~dp0
set JAVA_HOME=%SCRIPT_DIR%oracleJdk-25
set M2_HOME=%SCRIPT_DIR%apache-maven-3.9.6

REM Verificar se Java está disponível
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo Erro: Java não encontrado em %JAVA_HOME%
    echo Certifique-se de que a pasta oracleJdk-25 está presente
    exit /b 1
)

REM Verificar se Maven está disponível
if not exist "%M2_HOME%\bin\mvn.cmd" (
    echo Erro: Maven não encontrado em %M2_HOME%
    echo Certifique-se de que a pasta apache-maven-3.9.6 está presente
    exit /b 1
)

REM Configurar PATH
set PATH=%M2_HOME%\bin;%JAVA_HOME%\bin;%PATH%

REM Exibir versões
echo.
echo ===========================================
echo   CampuShop - Build Script
echo ===========================================
echo.
echo Java:
java -version
echo.
echo Maven:
mvn -v
echo.

REM Executar Maven com argumentos passados
if "%1"=="" (
    echo Compilando projeto (clean install)...
    mvn clean install
) else (
    echo Executando: mvn %*
    mvn %*
)

endlocal
pause
