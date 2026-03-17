# Script para testar conexão com MySQL
Write-Host "Testando conexão com MySQL..." -ForegroundColor Cyan

# Localizar cliente MySQL
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql*\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        break
    }
    # Tentar com wildcard
    $found = Get-ChildItem $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $mysqlExe = $found.FullName
        break
    }
}

if ($mysqlExe) {
    Write-Host "Cliente MySQL encontrado: $mysqlExe" -ForegroundColor Green
    Write-Host ""
    Write-Host "Executando: mysql -u root -p123456 -e 'SHOW DATABASES;'" -ForegroundColor Yellow
    & $mysqlExe -u root -p123456 -e "SHOW DATABASES;"
} else {
    Write-Host "Cliente MySQL não encontrado nos caminhos padrão." -ForegroundColor Red
    Write-Host "Por favor, verifique se o MySQL está instalado." -ForegroundColor Yellow
}
