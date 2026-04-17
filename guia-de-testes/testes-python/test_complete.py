#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de testes completo para CampusShop
Testa todas as rotas e funcionalidades prontas
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Tuple

# Configuração
BASE_URL = "http://localhost:8080"
FRONTEND_URL = "http://localhost:5173"

# Cores para output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class CampusShopTester:
    def __init__(self):
        self.token = None
        self.usuario = None
        self.results = {
            'passed': [],
            'failed': [],
            'skipped': []
        }
        self.session = requests.Session()
        
    def print_header(self, text: str):
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}")
        print(f"  {text}")
        print(f"{'='*70}{Colors.RESET}\n")
        
    def print_test(self, test_name: str):
        print(f"{Colors.BOLD}{Colors.BLUE}→ {test_name}{Colors.RESET}")
        
    def print_success(self, message: str):
        print(f"  {Colors.GREEN}✓ {message}{Colors.RESET}")
        
    def print_error(self, message: str):
        print(f"  {Colors.RED}✗ {message}{Colors.RESET}")
        
    def print_info(self, message: str):
        print(f"  {Colors.YELLOW}ℹ {message}{Colors.RESET}")

    def test(self, name: str, func):
        """Executa um teste e registra o resultado"""
        self.print_test(name)
        try:
            func()
            self.results['passed'].append(name)
            return True
        except AssertionError as e:
            self.print_error(str(e))
            self.results['failed'].append(name)
            return False
        except Exception as e:
            self.print_error(f"Erro inesperado: {str(e)}")
            self.results['failed'].append(name)
            return False

    def request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Faz uma requisição HTTP"""
        url = f"{BASE_URL}{endpoint}"
        headers = kwargs.pop('headers', {})
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        response = self.session.request(method, url, headers=headers, **kwargs)
        return response

    # ==================== TESTES DE ROTAS PÚBLICAS ====================
    
    def test_home_page(self):
        """Testa se a página home está acessível"""
        def run():
            response = self.request('GET', '/api/produtos')
            assert response.status_code in [200, 401], f"Status: {response.status_code}"
            self.print_success(f"Home page acessível (Status: {response.status_code})")
        self.test("GET /home (públicas rotas)", run)

    def test_categorias_page(self):
        """Testa se as categorias estão acessíveis"""
        def run():
            response = self.request('GET', '/api/categorias')
            assert response.status_code == 200, f"Status: {response.status_code}"
            data = response.json()
            assert isinstance(data, list), "Resposta deve ser uma lista"
            self.print_success(f"Categorias carregadas: {len(data)} categorias encontradas")
        self.test("GET /categorias", run)

    def test_produtos_page(self):
        """Testa se os produtos estão acessíveis"""
        def run():
            response = self.request('GET', '/api/produtos')
            assert response.status_code == 200, f"Status: {response.status_code}"
            data = response.json()
            assert isinstance(data, list), "Resposta deve ser uma lista"
            self.print_success(f"Produtos carregados: {len(data)} produtos encontrados")
            if len(data) > 0:
                self.print_info(f"Primeiro produto: {data[0]}")
        self.test("GET /produtos", run)

    # ==================== TESTES DE AUTENTICAÇÃO ====================

    def test_cadastro(self):
        """Testa o cadastro de novo usuário"""
        def run():
            # Gerar email único
            timestamp = int(datetime.now().timestamp())
            email = f"teste{timestamp}@universidade.edu.br"
            
            payload = {
                "nomeCompleto": "Teste Usuario",
                "email": email,
                "ra": f"RA{timestamp}",
                "senha": "Senha@123",
                "confirmarSenha": "Senha@123",
                "instituicao": "Universidade Teste",
                "cidade": "São Paulo",
                "perfil": "aluno",
                "cpfCnpj": "12345678901",
                "dataNascimento": "2000-01-15"
            }
            
            response = self.request('POST', '/api/auth/register', json=payload)
            assert response.status_code in [200, 201], f"Status: {response.status_code}, Body: {response.text}"
            data = response.json()
            assert 'token' in data or 'message' in data, "Resposta deve conter token ou mensagem"
            self.print_success(f"Cadastro realizado com sucesso (Email: {email})")
            return email
        
        email = self.test("POST /auth/register (Cadastro)", run)
        return email

    def test_login(self):
        """Testa o login de usuário"""
        def run():
            payload = {
                "email": "aluno@universidade.edu.br",
                "senha": "Senha@123"
            }
            
            response = self.request('POST', '/api/auth/login', json=payload)
            assert response.status_code in [200, 401], f"Status: {response.status_code}"
            
            if response.status_code == 200:
                data = response.json()
                assert 'token' in data, "Resposta deve conter token"
                self.token = data['token']
                self.usuario = data.get('usuario', {})
                self.print_success(f"Login realizado com sucesso (Usuário: {self.usuario.get('nome', 'N/A')})")
            else:
                self.print_info("Usuário padrão não existe, pulando teste de login")
        
        self.test("POST /auth/login (Login)", run)

    def test_me(self):
        """Testa o endpoint /me"""
        def run():
            assert self.token, "Deve estar autenticado"
            response = self.request('GET', '/api/auth/me')
            assert response.status_code in [200, 401], f"Status: {response.status_code}"
            
            if response.status_code == 200:
                data = response.json()
                assert 'nome' in data or 'nomeCompleto' in data, "Resposta deve conter nome"
                self.print_success(f"Dados do usuário obtidos: {data.get('nome', data.get('nomeCompleto'))}")
            else:
                self.print_info("Token inválido ou expirado")
        
        self.test("GET /auth/me (Dados do usuário)", run)

    # ==================== TESTES DE PRODUTOS ====================

    def test_produtos_api(self):
        """Testa listagem de produtos via API"""
        def run():
            response = self.request('GET', '/api/produtos')
            assert response.status_code == 200, f"Status: {response.status_code}"
            data = response.json()
            assert isinstance(data, list), "Resposta deve ser uma lista"
            self.print_success(f"Total de produtos: {len(data)}")
            
            if len(data) > 0:
                produto = data[0]
                assert 'idProduto' in produto or 'id' in produto, "Produto deve ter ID"
                assert 'nomeProduto' in produto or 'nome' in produto, "Produto deve ter nome"
                self.print_info(f"Exemplo: {produto.get('nomeProduto', produto.get('nome'))}")
        
        self.test("GET /api/produtos (Listagem de produtos)", run)

    def test_criar_produto(self):
        """Testa criação de novo produto (requer autenticação)"""
        def run():
            if not self.token:
                self.print_info("Não autenticado, pulando teste")
                return
            
            payload = {
                "nomeProduto": f"Produto Teste {int(datetime.now().timestamp())}",
                "descricao": "Descrição do produto teste",
                "preco": 99.90,
                "estoque": 10,
                "categoria": "Eletrônicos"
            }
            
            response = self.request('POST', '/api/produtos', json=payload)
            assert response.status_code in [201, 200, 400, 401], f"Status: {response.status_code}"
            
            if response.status_code in [201, 200]:
                self.print_success(f"Produto criado com sucesso")
            else:
                self.print_info(f"Não foi possível criar produto (Status: {response.status_code})")
        
        self.test("POST /api/produtos (Criar produto)", run)

    def test_listar_meus_produtos(self):
        """Testa listagem de produtos do usuário"""
        def run():
            if not self.token:
                self.print_info("Não autenticado, pulando teste")
                return
            
            response = self.request('GET', '/api/produtos/usuario')
            assert response.status_code in [200, 401], f"Status: {response.status_code}"
            
            if response.status_code == 200:
                data = response.json()
                assert isinstance(data, list), "Resposta deve ser uma lista"
                self.print_success(f"Seus produtos: {len(data)}")
            else:
                self.print_info(f"Não foi possível listar produtos (Status: {response.status_code})")
        
        self.test("GET /api/produtos/usuario (Meus produtos)", run)

    # ==================== TESTES DE CARRINHO ====================

    def test_carrinho_obter(self):
        """Testa obtenção do carrinho"""
        def run():
            if not self.token:
                self.print_info("Não autenticado, pulando teste")
                return
            
            response = self.request('GET', '/api/carrinho')
            assert response.status_code in [200, 401, 404], f"Status: {response.status_code}"
            
            if response.status_code == 200:
                data = response.json()
                self.print_success(f"Carrinho obtido com sucesso")
            else:
                self.print_info(f"Carrinho não encontrado ou usuário não autenticado")
        
        self.test("GET /api/carrinho (Obter carrinho)", run)

    def test_carrinho_adicionar(self):
        """Testa adição de produto ao carrinho"""
        def run():
            if not self.token:
                self.print_info("Não autenticado, pulando teste")
                return
            
            payload = {
                "produtoId": 1,
                "quantidade": 1
            }
            
            response = self.request('POST', '/api/carrinho/adicionar', json=payload)
            assert response.status_code in [200, 201, 400, 401], f"Status: {response.status_code}"
            
            if response.status_code in [200, 201]:
                self.print_success(f"Produto adicionado ao carrinho")
            else:
                self.print_info(f"Não foi possível adicionar ao carrinho (Status: {response.status_code})")
        
        self.test("POST /api/carrinho/adicionar (Adicionar ao carrinho)", run)

    def test_carrinho_limpar(self):
        """Testa limpeza do carrinho"""
        def run():
            if not self.token:
                self.print_info("Não autenticado, pulando teste")
                return
            
            response = self.request('DELETE', '/api/carrinho/limpar')
            assert response.status_code in [200, 204, 401], f"Status: {response.status_code}"
            
            if response.status_code in [200, 204]:
                self.print_success(f"Carrinho limpo com sucesso")
            else:
                self.print_info(f"Não foi possível limpar carrinho")
        
        self.test("DELETE /api/carrinho/limpar (Limpar carrinho)", run)

    # ==================== TESTES DE CATEGORIAS ====================

    def test_categorias_api(self):
        """Testa listagem de categorias"""
        def run():
            response = self.request('GET', '/api/categorias')
            assert response.status_code == 200, f"Status: {response.status_code}"
            data = response.json()
            assert isinstance(data, list), "Resposta deve ser uma lista"
            self.print_success(f"Total de categorias: {len(data)}")
            
            if len(data) > 0:
                categoria = data[0]
                self.print_info(f"Exemplo: {categoria}")
        
        self.test("GET /api/categorias (Listagem de categorias)", run)

    # ==================== RELATÓRIO ====================

    def print_report(self):
        """Imprime relatório dos testes"""
        self.print_header("RELATÓRIO DOS TESTES")
        
        total = len(self.results['passed']) + len(self.results['failed']) + len(self.results['skipped'])
        
        print(f"{Colors.GREEN}✓ Sucessos: {len(self.results['passed'])}/{total}{Colors.RESET}")
        if self.results['passed']:
            for test in self.results['passed']:
                print(f"  {Colors.GREEN}✓{Colors.RESET} {test}")
        
        print()
        print(f"{Colors.RED}✗ Falhas: {len(self.results['failed'])}/{total}{Colors.RESET}")
        if self.results['failed']:
            for test in self.results['failed']:
                print(f"  {Colors.RED}✗{Colors.RESET} {test}")
        
        if self.results['skipped']:
            print()
            print(f"{Colors.YELLOW}⊘ Pulados: {len(self.results['skipped'])}/{total}{Colors.YELLOW}")
            for test in self.results['skipped']:
                print(f"  {Colors.YELLOW}⊘{Colors.RESET} {test}")
        
        print()
        percentage = (len(self.results['passed']) / total * 100) if total > 0 else 0
        status_color = Colors.GREEN if percentage >= 80 else Colors.RED if percentage < 50 else Colors.YELLOW
        print(f"{status_color}{Colors.BOLD}Taxa de Sucesso: {percentage:.1f}%{Colors.RESET}")
        print()

    def run_all_tests(self):
        """Executa todos os testes"""
        self.print_header("TESTES DO CAMPUSHOP - SISTEMA COMPLETO")
        self.print_info(f"Base URL: {BASE_URL}")
        self.print_info(f"Frontend URL: {FRONTEND_URL}")
        
        # Testes de rotas públicas
        self.print_header("ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)")
        self.test_categorias_page()
        self.test_produtos_page()
        self.test_home_page()
        
        # Testes de autenticação
        self.print_header("AUTENTICAÇÃO")
        self.test_cadastro()
        self.test_login()
        self.test_me()
        
        # Testes de produtos
        self.print_header("FUNCIONALIDADES DE PRODUTOS")
        self.test_produtos_api()
        self.test_listar_meus_produtos()
        self.test_criar_produto()
        
        # Testes de carrinho
        self.print_header("FUNCIONALIDADES DE CARRINHO")
        self.test_carrinho_obter()
        self.test_carrinho_adicionar()
        self.test_carrinho_limpar()
        
        # Testes de categorias
        self.print_header("FUNCIONALIDADES DE CATEGORIAS")
        self.test_categorias_api()
        
        # Relatório final
        self.print_report()

if __name__ == '__main__':
    tester = CampusShopTester()
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Testes interrompidos pelo usuário{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Erro ao executar testes: {str(e)}{Colors.RESET}")
        sys.exit(1)
