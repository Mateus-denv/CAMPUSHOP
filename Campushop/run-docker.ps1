# Script para rodar CampuShop com Docker
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   CampuShop - Docker Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está instalado
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Docker não está instalado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Docker Desktop:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker está rodando
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Docker não está rodando!" -ForegroundColor Red
    Write-Host "Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker encontrado e rodando!" -ForegroundColor Green
Write-Host ""

# Perguntar ação
Write-Host "Escolha uma opção:" -ForegroundColor Yellow
Write-Host "1. Iniciar aplicação (build + run)"
Write-Host "2. Parar aplicação"
Write-Host "3. Ver logs"
Write-Host "4. Rebuild (reconstruir imagem)"
Write-Host ""
$opcao = Read-Host "Digite o número da opção"

switch ($opcao) {
    "1" {
        Write-Host ""
        Write-Host "Iniciando CampuShop..." -ForegroundColor Green
        docker-compose up -d
        Write-Host ""
        Write-Host "✓ Aplicação iniciada!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Acesse: http://localhost:8080" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Para ver os logs, execute: .\run-docker.ps1 e escolha opção 3" -ForegroundColor Yellow
    }
    "2" {
        Write-Host ""
        Write-Host "Parando CampuShop..." -ForegroundColor Yellow
        docker-compose down
        Write-Host ""
        Write-Host "✓ Aplicação parada!" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "Mostrando logs (Ctrl+C para sair)..." -ForegroundColor Cyan
        docker-compose logs -f app
    }
    "4" {
        Write-Host ""
        Write-Host "Reconstruindo imagem..." -ForegroundColor Yellow
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        Write-Host ""
        Write-Host "✓ Aplicação reconstruída e iniciada!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Acesse: http://localhost:8080" -ForegroundColor Cyan
    }
    default {
        Write-Host "Opcao invalida!" -ForegroundColor Red
    }
}
