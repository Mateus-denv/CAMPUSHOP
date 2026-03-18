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
    docker-compose up -d
    echo.
    echo Aplicacao iniciada!
    echo.
    echo Acesse: http://localhost:8080
    echo.
    pause
) else if "%opcao%"=="2" (
    echo.
    echo Parando CampuShop...
    docker-compose down
    echo.
    echo Aplicacao parada!
    pause
) else if "%opcao%"=="3" (
    echo.
    echo Mostrando logs (Ctrl+C para sair)...
    docker-compose logs -f app
) else if "%opcao%"=="4" (
    echo.
    echo Reconstruindo imagem...
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo.
    echo Aplicacao reconstruida e iniciada!
    echo.
    echo Acesse: http://localhost:8080
    pause
) else (
    echo Opcao invalida!
    pause
)
