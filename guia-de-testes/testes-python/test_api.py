#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar fluxo completo de cadastro de produto usando urllib
"""
import urllib.request
import json
from datetime import datetime

BASE_URL = "http://localhost:8080/api"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def make_request(method, url, data=None, headers=None):
    """Faz requisição HTTP"""
    if headers is None:
        headers = {}
    
    headers['Content-Type'] = 'application/json'
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return None, str(e)

def test_registro():
    """Tenta registrar novo usuário"""
    print_section("1. TESTE DE CADASTRO DE USUÁRIO")
    
    # CPF válido segundo algoritmo de validação (vérificado)
    dados = {
        "nomeCompleto": "Joana Lima Santos",
        "email": "joana@mail.com",
        "ra": "777888999",
        "senha": "senha123",
        "confirmarSenha": "senha123",
        "instituicao": "USP",
        "cidade": "São Paulo",
        "perfil": "aluno",
        "cpfCnpj": "11144477735",  # CPF válido
        "dataNascimento": "1999-06-15"  # Maior de 18 anos
    }
    
    status, resp = make_request("POST", f"{BASE_URL}/auth/register", data=dados)
    print(f"Status: {status}")
    print(f"Response: {resp[:200]}")
    
    try:
        resp_json = json.loads(resp)
        if status in [200, 201]:
            token = resp_json.get('token')
            print(f"✓ Token: {token[:30] if token else 'N/A'}...")
            return token
    except:
        pass
    
    return None

def test_login():
    """Tenta fazer login"""
    print_section("2. TESTE DE LOGIN")
    
    dados = {
        "email": "joana@mail.com",
        "senha": "senha123"
    }
    
    status, resp = make_request("POST", f"{BASE_URL}/auth/login", data=dados)
    print(f"Status: {status}")
    print(f"Response: {resp[:200]}")
    
    try:
        resp_json = json.loads(resp)
        if status == 200:
            token = resp_json.get('token')
            print(f"✓ Token: {token[:30] if token else 'N/A'}...")
            return token
    except:
        pass
    
    return None

def test_get_categorias():
    """Get categorias disponíveis"""
    print_section("3. LISTAR CATEGORIAS")
    
    status, resp = make_request("GET", f"{BASE_URL}/categorias")
    print(f"Status: {status}")
    
    try:
        cats = json.loads(resp)
        print(f"Total de categorias: {len(cats)}")
        
        if cats:
            cat = cats[0]
            print(f"Primeira: ID={cat.get('idCategoria')}, {cat.get('nome_categoria')}")
            return cat.get('idCategoria')
    except:
        pass
    
    return 1

def test_criar_produto(token, cat_id):
    """Cria um novo produto"""
    print_section("4. CADASTRO DE PRODUTO")
    
    if not token:
        print("❌ Sem token! Pulando...")
        return
    
    dados = {
        "nomeProduto": "Design Patterns",
        "descricao": "Padrões de design de software",
        "estoque": 5,
        "preco": 79.90,
        "categoria": {"idCategoria": cat_id}
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    status, resp = make_request("POST", f"{BASE_URL}/produtos", data=dados, headers=headers)
    print(f"Status: {status}")
    print(f"Response: {resp[:200]}")
    
    if status in [200, 201]:
        print("✓ Produto criado com sucesso!")
    else:
        print("✗ Falha ao criar produto")

def test_listar_produtos():
    """Lista produtos"""
    print_section("5. LISTAR PRODUTOS")
    
    status, resp = make_request("GET", f"{BASE_URL}/produtos")
    print(f"Status: {status}")
    
    try:
        prods = json.loads(resp)
        print(f"Total de produtos: {len(prods)}")
        
        for p in prods[:3]:
            print(f"  - {p.get('nomeProduto')}: R${p.get('preco')}")
    except Exception as e:
        print(f"Erro ao parsear: {e}")

if __name__ == "__main__":
    print("\n🚀 TESTE DE API - CampusShop")
    print(f"   Timestamp: {datetime.now()}")
    
    # Testar categorias primeiro
    cat_id = test_get_categorias()
    
    # Tentar registro
    token = test_registro()
    
    # Se registro falhou, tentar login
    if not token:
        print("\n[*] Registro falhou, tentando login...")
        token = test_login()
    
    # Se tem token, criar produto
    if token:
        print(f"\n✓ Token obtido!")
        test_criar_produto(token, cat_id)
    else:
        print("\n✗ Não foi possível obter token")
    
    # Listar produtos finais
    test_listar_produtos()
    
    print("\n" + "="*60)
    print("Testes concluídos!")
    print("="*60 + "\n")
