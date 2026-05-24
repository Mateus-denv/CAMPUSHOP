#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de testes com autenticação - CampusShop
Testa rotas autenticadas
"""

import os
import requests
import json
from datetime import datetime
import random

BASE_URL = os.getenv("CAMPUSHOP_API_URL", "http://localhost:8080")

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_section(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}{Colors.RESET}\n")

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")

def print_info(msg):
    print(f"{Colors.YELLOW}ℹ {msg}{Colors.RESET}")

def generate_unique_email():
    return f"usuario{int(datetime.now().timestamp())}@campushop.com"


def generate_unique_ra():
    return ''.join(str(random.randint(0, 9)) for _ in range(9))


def register_test_user(email, senha):
    dados = {
        "nomeCompleto": "Teste Automático",
        "email": email,
        "ra": generate_unique_ra(),
        "senha": senha,
        "confirmarSenha": senha,
        "instituicao": "Universidade Teste",
        "cidade": "Salvador",
        "perfil": "aluno",
        "cpfCnpj": "11144477735",
        "dataNascimento": "1999-06-15",
        "saldoVendas": 0.0
    }
    return requests.post(f"{BASE_URL}/api/auth/register", json=dados)


def test_with_user():
    """Testa com um usuário existente ou cadastrado dinamicamente"""
    
    print_section("TESTES COM AUTENTICAÇÃO")
    
    email = generate_unique_email()
    senha = "Senha@123"
    login_data = {"email": email, "senha": senha}
    
    print("1. Fazendo login com usuário de teste...")
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if response.status_code != 200:
        print_info(f"Login falhou ({response.status_code}), tentando registrar usuário de teste...")
        reg_response = register_test_user(email, senha)
        if reg_response.status_code in [200, 201]:
            print_success(f"Usuário registrado com sucesso: {email}")
            response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        else:
            print_error(f"Falha ao registrar usuário: Status {reg_response.status_code}")
            print_info(f"Resposta: {reg_response.text}")
            return None
    
    if response.status_code != 200:
        print_error(f"Falha no login: Status {response.status_code}")
        print_info(f"Resposta: {response.text}")
        return None
    
    data = response.json()
    token = data.get('token')
    usuario = data.get('usuario', {})
    
    if not token:
        print_error("Nenhum token recebido")
        return None
    
    print_success(f"Login realizado: {usuario.get('nomeCompleto', usuario.get('nome'))}")
    print_info(f"Token: {token[:50]}...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Teste: Obter dados do usuário
    print("\n2. Obtendo dados do usuário...")
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    if response.status_code == 200:
        usuario_data = response.json()
        print_success(f"Dados obtidos: {usuario_data.get('nomeCompleto', usuario_data.get('nome'))}")
        print_info(f"Email: {usuario_data.get('email')}")
        print_info(f"RA: {usuario_data.get('ra')}")
    else:
        print_error(f"Falha: Status {response.status_code}")
    
    # Teste: Obter carrinho
    print("\n3. Obtendo carrinho do usuário...")
    response = requests.get(f"{BASE_URL}/api/carrinho", headers=headers)
    if response.status_code == 200:
        carrinho = response.json()
        print_success(f"Carrinho obtido")
        if isinstance(carrinho, list):
            print_info(f"Itens: {len(carrinho)}")
        else:
            print_info(f"Itens: {len(carrinho.get('itens', []))}")
    elif response.status_code == 404:
        print_info("Carrinho vazio ou não encontrado")
    else:
        print_error(f"Falha: Status {response.status_code}")
    
    # Teste: Listar produtos do usuário
    print("\n4. Listando produtos do usuário...")
    response = requests.get(f"{BASE_URL}/api/produtos/usuario", headers=headers)
    if response.status_code == 200:
        produtos = response.json()
        print_success(f"Produtos encontrados: {len(produtos)}")
        for prod in produtos[:3]:
            print_info(f"  - {prod.get('nomeProduto', prod.get('nome'))}")
    else:
        print_error(f"Falha: Status {response.status_code}")
    
    # Teste: Adicionar produto ao carrinho
    print("\n5. Adicionando produto ao carrinho...")
    add_data = {
        "produtoId": 1,
        "quantidade": 1
    }
    response = requests.post(f"{BASE_URL}/api/carrinho/adicionar", json=add_data, headers=headers)
    if response.status_code in [200, 201]:
        print_success(f"Produto adicionado ao carrinho")
    else:
        print_error(f"Falha: Status {response.status_code}")
        print_info(f"Resposta: {response.text}")
    
    # Teste: Obter carrinho após adicionar
    print("\n6. Verificando carrinho após adição...")
    response = requests.get(f"{BASE_URL}/api/carrinho", headers=headers)
    if response.status_code == 200:
        carrinho = response.json()
        if isinstance(carrinho, list):
            itens = carrinho
        else:
            itens = carrinho.get('itens', [])
        print_success(f"Carrinho atualizado: {len(itens)} itens")
    else:
        print_error(f"Falha: Status {response.status_code}")
    
    # Teste: Listar todas as categorias
    print("\n7. Listando categorias...")
    response = requests.get(f"{BASE_URL}/api/categorias", headers=headers)
    if response.status_code == 200:
        categorias = response.json()
        print_success(f"Categorias encontradas: {len(categorias)}")
        for cat in categorias[:5]:
            print_info(f"  - {cat.get('nome_categoria', cat.get('nome'))}")
    else:
        print_error(f"Falha: Status {response.status_code}")
    
    # Teste: Listar todos os produtos
    print("\n8. Listando todos os produtos...")
    response = requests.get(f"{BASE_URL}/api/produtos", headers=headers)
    if response.status_code == 200:
        produtos = response.json()
        print_success(f"Produtos encontrados: {len(produtos)}")
        for prod in produtos[:3]:
            print_info(f"  - {prod.get('nomeProduto', prod.get('nome'))} - R$ {prod.get('preco')}")
    else:
        print_error(f"Falha: Status {response.status_code}")
    
    # Teste: Limpar carrinho
    print("\n9. Limpando carrinho...")
    response = requests.delete(f"{BASE_URL}/api/carrinho", headers=headers)
    if response.status_code in [200, 204]:
        print_success(f"Carrinho limpo com sucesso")
    elif response.status_code == 404:
        print_info("Carrinho não encontrado ou já vazio")
    else:
        print_info(f"Carrinho não foi limpo (Status: {response.status_code})")
    
    print_section("TESTES COMPLETADOS")

if __name__ == '__main__':
    test_with_user()
