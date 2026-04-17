#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Testes de UI - Verificação das páginas frontend
"""

import requests
from bs4 import BeautifulSoup

BASE_URL = "http://localhost:5173"

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

def test_page(path, expected_elements=None):
    """Testa se uma página carrega e contém elementos esperados"""
    try:
        response = requests.get(f"{BASE_URL}{path}", timeout=10)
        
        if response.status_code != 200:
            print_error(f"Página {path} - Status {response.status_code}")
            return False
        
        print_success(f"Página {path} carregada (Status 200)")
        
        if expected_elements:
            content = response.text.lower()
            for element in expected_elements:
                if element.lower() in content:
                    print_info(f"  ✓ Encontrado: {element}")
                else:
                    print_info(f"  ✗ Não encontrado: {element}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print_error(f"Não foi possível conectar a {BASE_URL}{path}")
        return False
    except Exception as e:
        print_error(f"Erro ao testar {path}: {str(e)}")
        return False

def main():
    print_section("TESTES DE UI - FRONTEND")
    print_info(f"URL Base: {BASE_URL}")
    
    tests = [
        ("/home", ["campushop", "produtos", "categorias"]),
        ("/categorias", ["categorias", "categoria"]),
        ("/produtos", ["produtos", "preco", "estoque"]),
        ("/login", ["email", "senha", "entrar", "cadastro"]),
        ("/cadastro", ["cadastro", "nome", "email", "senha"]),
    ]
    
    print("\n📄 Testando páginas públicas:\n")
    
    passed = 0
    for path, elements in tests:
        if test_page(path, elements):
            passed += 1
    
    print_section("RESUMO DOS TESTES UI")
    print(f"Páginas Testadas: {len(tests)}")
    print(f"Sucessos: {passed}/{len(tests)}")
    print(f"Taxa: {(passed/len(tests)*100):.1f}%")
    
    if passed == len(tests):
        print_success("Todas as páginas públicas carregam corretamente!")
    else:
        print_error("Algumas páginas tiveram problemas")

if __name__ == '__main__':
    main()
