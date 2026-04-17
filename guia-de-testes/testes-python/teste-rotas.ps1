# Script para testar todas as rotas da API CampusShop

$baseUrl = "http://localhost:8080"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "TESTE DE ROTAS - CAMPUSHOP API" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 1. Testar GET /api/categorias (público)
Write-Host "`n[1] GET /api/categorias (público)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/categorias" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "Categorias encontradas: $($response.Count)" -ForegroundColor Gray
    $response | ConvertTo-Json | Write-Host
}
catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Testar GET /api/produtos (público)
Write-Host "`n[2] GET /api/produtos (público)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/produtos" -Method Get -ContentType "application/json"
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "Produtos encontrados: $($response.Count)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Testar LOGIN
Write-Host "`n[3] POST /api/auth/login" -ForegroundColor Yellow
$loginBody = @{
    email = "usuario@example.com"
    senha = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "Token: $token" -ForegroundColor Gray
    
    # 4. Testar cadastro de produto com autenticação
    Write-Host "`n[4] POST /api/produtos (com autenticação)" -ForegroundColor Yellow
    $produtoBody = @{
        nomeProduto = "Sanduíche Natural"
        descricao   = "Sanduíche natural de excelente qualidade"
        estoque     = 20
        preco       = 15.50
        status      = "ATIVO"
        dimensoes   = "20x15x2 cm"
        peso        = 0.5
        categoria   = @{
            idCategoria = 1
        }
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type"  = "application/json"
    }

    try {
        $produtoResponse = Invoke-RestMethod -Uri "$baseUrl/api/produtos" -Method Post -Body $produtoBody -Headers $headers
        Write-Host "✓ Produto cadastrado com sucesso!" -ForegroundColor Green
        Write-Host "ID do produto: $($produtoResponse.idProduto)" -ForegroundColor Gray
        $produtoResponse | ConvertTo-Json | Write-Host
    }
    catch {
        Write-Host "✗ Erro ao cadastrar produto: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }

    # 5. Testar GET /api/produtos/usuario (listagem de produtos do usuário)
    Write-Host "`n[5] GET /api/produtos/usuario (com autenticação)" -ForegroundColor Yellow
    try {
        $usuarioResponse = Invoke-RestMethod -Uri "$baseUrl/api/produtos/usuario" -Method Get -Headers $headers
        Write-Host "✓ Produtos do usuário encontrados!" -ForegroundColor Green
        Write-Host "Total: $($usuarioResponse.Count)" -ForegroundColor Gray
        $usuarioResponse | ConvertTo-Json | Write-Host
    }
    catch {
        Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }

}
catch {
    Write-Host "✗ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "TESTES CONCLUÍDOS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
