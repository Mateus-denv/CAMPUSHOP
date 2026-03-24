@echo off
REM Script para rodar CampuShop com Docker

echo.
echo ==========================================
echo    CampuShop - Docker Setup
echo ==========================================
echo.

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker nao esta instalado!
    echo Por favor, instale o Docker Desktop:
    echo https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker encontrado!
echo.

REM Definir comando compose (docker compose ou docker-compose)
docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    set "COMPOSE_CMD=docker compose"
) else (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERRO: Nem "docker compose" nem "docker-compose" estao disponiveis.
        pause
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
)


echo Escolha uma opcao:
echo 1. Iniciar aplicacao (build + run)
echo 2. Parar aplicacao
echo 3. Ver logs
echo 4. Rebuild (reconstruir imagem)
echo.
set /p opcao="Digite o numero da opcao: "

if "%opcao%"=="1" (
    echo.
    echo Iniciando CampuShop...
    %COMPOSE_CMD% up -d --build
    echo.
    echo Aplicacao iniciada!
    echo.
    echo Acesse: http://localhost:8080
    echo.
    pause
) else if "%opcao%"=="2" (
    echo.
    echo Parando CampuShop...
    %COMPOSE_CMD% down
    echo.
    echo Aplicacao parada!
    pause
) else if "%opcao%"=="3" (
    echo.
    echo Mostrando logs (Ctrl+C para sair)...
    %COMPOSE_CMD% logs -f app
) else if "%opcao%"=="4" (
    echo.
    echo Reconstruindo imagem...
    %COMPOSE_CMD% down
    %COMPOSE_CMD% build --no-cache
    %COMPOSE_CMD% up -d
    echo.
    echo Aplicacao reconstruida e iniciada!
    echo.
    echo Acesse: http://localhost:8080
    pause
) else (
    echo Opcao invalida!
    pause
)
