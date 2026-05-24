#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Teste funcional do fluxo de pedido: vender e resgatar código entre usuários."""

import os
import random
import string
import requests
from datetime import datetime

BASE_URL = os.getenv("CAMPUSHOP_API_URL", "http://localhost:8080")
DEFAULT_BUYER_EMAIL = "maria@campushop.com"
DEFAULT_SELLER_EMAIL = "joao@campushop.com"
DEFAULT_PASSWORD = "123456"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}")
    print(f"  {message}")
    print(f"{'='*70}{Colors.RESET}\n")


def random_email(prefix: str = "user"):
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"{prefix}_{suffix}@campushop.com"


def random_ra():
    return ''.join(str(random.randint(0, 9)) for _ in range(9))


def request(method: str, path: str, token: str = None, **kwargs):
    url = f"{BASE_URL}{path}"
    headers = kwargs.pop('headers', {})
    if token:
        headers['Authorization'] = f'Bearer {token}'
    return requests.request(method, url, headers=headers, **kwargs)


def pretty_print_json(prefix: str, response: requests.Response):
    print(f"{prefix} - status={response.status_code}")
    try:
        print(response.json())
    except Exception:
        print(response.text)


def login_user(email: str, senha: str):
    payload = {"email": email, "senha": senha}
    return request('POST', '/api/auth/login', json=payload)


def register_user(email: str, senha: str, nome: str, perfil: str):
    payload = {
        "nomeCompleto": nome,
        "email": email,
        "ra": random_ra(),
        "senha": senha,
        "confirmarSenha": senha,
        "instituicao": "Universidade Teste",
        "cidade": "Salvador",
        "perfil": perfil,
        "cpfCnpj": "11144477735",
        "dataNascimento": "1999-01-01",
        "saldoVendas": 0.0
    }
    return request('POST', '/api/auth/register', json=payload)


def ensure_user(email: str, senha: str, nome: str, perfil: str):
    login_resp = login_user(email, senha)
    if login_resp.status_code == 200:
        pretty_print_json(f"Login existente ({email})", login_resp)
        return login_resp.json().get('token')

    pretty_print_json(f"Login falho ({email})", login_resp)
    print(f"{Colors.YELLOW}Criando usuário {email}...{Colors.RESET}")
    create_resp = register_user(email, senha, nome, perfil)
    pretty_print_json(f"Registro usuário ({email})", create_resp)
    if create_resp.status_code not in [200, 201]:
        raise RuntimeError(f"Não foi possível criar usuário {email}")
    return create_resp.json().get('token')


def choose_product_with_stock(products: list):
    for produto in products:
        estoque = produto.get('estoque')
        try:
            if int(estoque) > 0:
                return produto
        except Exception:
            continue
    return None


def create_product(token: str):
    nome = f"Produto Teste {datetime.now().strftime('%Y%m%d%H%M%S')}"
    payload = {
        "nomeProduto": nome,
        "descricao": "Produto criado automaticamente para teste funcional",
        "estoque": 3,
        "preco": 19.9,
        "status": "ATIVO",
        "categoria": {"idCategoria": 8}
    }
    return request('POST', '/api/produtos', token=token, json=payload)


def get_order_id(pedido: dict):
    return pedido.get('idPedido') or pedido.get('id')


def get_order_code(pedido: dict):
    return pedido.get('chaveAcesso') or pedido.get('chaveEntrega')


def get_order_status(pedido: dict):
    return pedido.get('status') or pedido.get('statusPedido')


def main():
    print_header("TESTE FUNCIONAL: VENDENDO E RESGATANDO CÓDIGO ENTRE USUÁRIOS")

    buyer_token = ensure_user(DEFAULT_BUYER_EMAIL, DEFAULT_PASSWORD, "Maria Souza", "comprador")
    seller_token = ensure_user(DEFAULT_SELLER_EMAIL, DEFAULT_PASSWORD, "Joao Lima", "vendedor")

    print_header("1. Verificar produtos disponíveis do vendedor")
    produtos_vendedor_resp = request('GET', '/api/produtos/usuario', token=seller_token)
    pretty_print_json("Produtos do vendedor", produtos_vendedor_resp)
    if produtos_vendedor_resp.status_code != 200:
        raise RuntimeError("Erro ao listar produtos do vendedor")

    produto = choose_product_with_stock(produtos_vendedor_resp.json())
    if produto is None:
        print(f"{Colors.YELLOW}Nenhum produto do vendedor encontrado com estoque. Criando um produto novo...{Colors.RESET}")
        criar_produto_resp = create_product(seller_token)
        pretty_print_json("Criar produto", criar_produto_resp)
        if criar_produto_resp.status_code not in [200, 201]:
            raise RuntimeError("Falha ao criar produto do vendedor")
        produto = criar_produto_resp.json()

    produto_id = produto.get('idProduto') or produto.get('id')
    print_header("2. Adicionar produto ao carrinho do comprador")
    print(f"Produto selecionado: {produto.get('nomeProduto', produto.get('nome'))} (ID={produto_id}) estoque={produto.get('estoque')}")
    cart_resp = request('POST', '/api/carrinho/adicionar', token=buyer_token, json={"produtoId": produto_id, "quantidade": 1})
    pretty_print_json("Adicionar ao carrinho", cart_resp)
    if cart_resp.status_code not in [200, 201]:
        raise RuntimeError("Falha ao adicionar produto ao carrinho")

    print_header("3. Confirmar pedido do comprador")
    confirmar_resp = request('POST', '/api/pedidos/confirmar', token=buyer_token)
    pretty_print_json("Confirmar pedido", confirmar_resp)
    if confirmar_resp.status_code not in [200, 201]:
        raise RuntimeError("Falha ao confirmar o pedido")

    pedidos = confirmar_resp.json()
    if not pedidos:
        raise RuntimeError("Nenhum pedido criado")

    pedido = pedidos[0]
    pedido_id = get_order_id(pedido)
    print(f"Pedido criado: ID={pedido_id}, status={get_order_status(pedido)}")

    print_header("4. Vendedor aceita o pedido")
    aceitar_resp = request('PUT', f'/api/pedidos/{pedido_id}/status', token=seller_token, json={"status": "aceito"})
    pretty_print_json("Aceitar pedido", aceitar_resp)
    if aceitar_resp.status_code != 200:
        raise RuntimeError("Falha ao aceitar o pedido")

    pedido_aceito = aceitar_resp.json()
    codigo_acesso = get_order_code(pedido_aceito)
    print(f"Código de acesso gerado: {codigo_acesso}")
    if not codigo_acesso:
        raise RuntimeError("Código de acesso não foi gerado após aceitação")

    print_header("5. Vendedor valida entrega com o código fornecido")
    entregar_resp = request('PUT', f'/api/pedidos/{pedido_id}/status', token=seller_token, json={"status": "entregue", "codigoAcesso": codigo_acesso})
    pretty_print_json("Entregar pedido", entregar_resp)
    if entregar_resp.status_code != 200:
        raise RuntimeError("Falha ao validar o pedido com o código de entrega")

    pedido_entregue = entregar_resp.json()
    print(f"Pedido entregue com sucesso. Status final: {get_order_status(pedido_entregue)}")

    print_header("6. Verificação final")
    meus_resp = request('GET', '/api/pedidos/meus', token=buyer_token)
    pretty_print_json("Pedidos do comprador", meus_resp)
    recebidos_resp = request('GET', '/api/pedidos/recebidos', token=seller_token)
    pretty_print_json("Pedidos do vendedor", recebidos_resp)

    print(f"{Colors.GREEN}Fluxo concluído com sucesso. Comprador e vendedor válidos.{Colors.RESET}")


if __name__ == '__main__':
    main()
