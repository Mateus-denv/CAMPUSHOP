# Relatório de Testes Automatizados - CAMPUSHOP

## Ambiente
- Projeto rodando no Docker
- API disponível em `http://localhost:8080`
- MySQL disponível via container `campushop-mysql`

## Correções aplicadas
- Ajustado backend para suportar o campo obrigatório `saldo_vendas` na entidade `Usuario`
  - arquivo: `src/main/java/br/com/campushop/campushop_backend/model/Usuario.java`
  - arquivo: `src/main/java/br/com/campushop/campushop_backend/controller/AuthController.java`
- Atualizado script de UI para usar `localhost:8080` em vez de `5173`
  - arquivo: `guia-de-testes/testes-python/test_ui.py`
- Tornado testes de autenticação mais robustos criando usuário de teste quando o login inicial falha
  - arquivo: `guia-de-testes/testes-python/test_authenticated.py`
  - arquivo: `guia-de-testes/testes-python/teste_rotas.py`
- Corrigido o fluxo de login em `test_complete.py` para usar a senha correta do usuário registrado
  - arquivo: `guia-de-testes/testes-python/test_complete.py`

## Resultados dos scripts
### `test_complete.py`
- Resultado: 13/13 testes passaram
- Status: **100%**
- Observação: após a correção do backend, o fluxo completo de autenticação e endpoints API completou com sucesso.

### `test_api.py`
- Resultado: script executou e validou cadastro de usuário e criação de produto
- Observação: o login está configurado com usuário fixo que não existe no banco atual; o fluxo principal de criação ainda funciona pelo token de registro.

### `teste_rotas.py`
- Resultado: registou usuário de teste dinamicamente e consumiu as rotas autenticadas com sucesso.

### `test_authenticated.py`
- Resultado: passou a autenticação dinâmica e verificou endpoints de usuário, categorias e carrinho.
- Nota: a tentativa de adicionar produto ao carrinho retornou `400` devido à quantidade solicitada ultrapassar o estoque disponível.

### `test_ui.py`
- Resultado: 5/5 páginas carregaram corretamente em `http://localhost:8080`
- Status: **100%**

## Como validar novamente
```powershell
cd c:\Users\mateu\Documents\GitHub\CAMPUSHOP\guia-de-testes\testes-python
c:\Users\mateu\Documents\GitHub\CAMPUSHOP\.venv\Scripts\python.exe test_complete.py
c:\Users\mateu\Documents\GitHub\CAMPUSHOP\.venv\Scripts\python.exe test_api.py
c:\Users\mateu\Documents\GitHub\CAMPUSHOP\.venv\Scripts\python.exe teste_rotas.py
c:\Users\mateu\Documents\GitHub\CAMPUSHOP\.venv\Scripts\python.exe test_authenticated.py
c:\Users\mateu\Documents\GitHub\CAMPUSHOP\.venv\Scripts\python.exe test_ui.py
```
