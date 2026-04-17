#!/usr/bin/env python3
"""Script para testar todas as rotas da API CampusShop"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8080"

print("\n" + "="*50)
print("TESTE DE ROTAS - CAMPUSHOP API")
print("="*50 + "\n")

# 1. Testar GET /api/categorias (público)
print("[1] GET /api/categorias (público)")
try:
    response = requests.get(f"{BASE_URL}/api/categorias", timeout=5)
    print(f"✓ Status: {response.status_code}")
    if response.status_code == 200:
        categorias = response.json()
        print(f"  Categorias encontradas: {len(categorias)}")
        for cat in categorias[:3]:
            print(f"  - ID: {cat.get('idCategoria', cat.get('id'))}, Nome: {cat.get('nome_categoria', cat.get('nome'))}")
    print()
except Exception as e:
    print(f"✗ Erro: {e}\n")

# 2. Testar GET /api/produtos (público)
print("[2] GET /api/produtos (público)")
try:
    response = requests.get(f"{BASE_URL}/api/produtos", timeout=5)
    print(f"✓ Status: {response.status_code}")
    if response.status_code == 200:
        produtos = response.json()
        print(f"  Produtos encontrados: {len(produtos)}")
    print()
except Exception as e:
    print(f"✗ Erro: {e}\n")

# 3. Testar LOGIN
print("[3] POST /api/auth/login")
login_data = {
    "email": "usuario@example.com",
    "senha": "123456"
}

try:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=login_data,
        timeout=5
    )
    print(f"✓ Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"  Token obtido: {token[:50]}...")
        print()
        
        # 4. Testar cadastro de produto
        print("[4] POST /api/produtos (com token)")
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        produto_data = {
            "nomeProduto": "Sanduíche Natural",
            "descricao": "Sanduíche natural de excelente qualidade",
            "estoque": 20,
            "preco": 15.50,
            "status": "ATIVO",
            "dimensoes": "20x15x2 cm",
            "peso": 0.5,
            "categoria": {
                "idCategoria": 1
            }
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/produtos",
                json=produto_data,
                headers=headers,
                timeout=5
            )
            print(f"✓ Status: {response.status_code}")
            if response.status_code in [200, 201]:
                produto = response.json()
                print(f"  Produto cadastrado! ID: {produto.get('idProduto')}")
            else:
                print(f"  Erro: {response.json()}")
            print()
        except Exception as e:
            print(f"✗ Erro: {e}\n")
        
        # 5. Testar GET /api/produtos/usuario
        print("[5] GET /api/produtos/usuario")
        try:
            response = requests.get(
                f"{BASE_URL}/api/produtos/usuario",
                headers=headers,
                timeout=5
            )
            print(f"✓ Status: {response.status_code}")
            if response.status_code == 200:
                produtos = response.json()
                print(f"  Produtos do usuário: {len(produtos)}")
            print()
        except Exception as e:
            print(f"✗ Erro: {e}\n")
        
        # 6. Testar GET /api/produtos/{id}
        if response.status_code == 200 and len(produtos) > 0:
            produto_id = produtos[0].get('idProduto')
            print(f"[6] GET /api/produtos/{produto_id}")
            try:
                response = requests.get(
                    f"{BASE_URL}/api/produtos/{produto_id}",
                    timeout=5
                )
                print(f"✓ Status: {response.status_code}")
                if response.status_code == 200:
                    produto = response.json()
                    print(f"  Nome: {produto.get('nomeProduto')}")
                    print(f"  Preço: R$ {produto.get('preco')}")
                print()
            except Exception as e:
                print(f"✗ Erro: {e}\n")
    else:
        print(f"  Erro no login: {response.json()}")
        print()

except Exception as e:
    print(f"✗ Erro: {e}\n")

print("="*50)
print("TESTES CONCLUÍDOS")
print("="*50 + "\n")
