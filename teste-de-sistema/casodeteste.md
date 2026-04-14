# CASOS DE TESTE  
## Sistema CampuShop


## Estrutura do Caso de Teste

Cada caso contém:

- ID  
- Módulo  
- Tipo (Positivo ou Negativo)  
- Pré-condição  
- Passos  
- Dados  
- Resultado Esperado  

---

# 🔹 MÓDULO: AUTENTICAÇÃO

### CT-01  
Módulo: Autenticação  
Tipo: Positivo  

Pré-condição: Usuário previamente cadastrado.

Passos:

1. Abrir Postman.  
2. Criar requisição POST para /login.  
3. Inserir email e senha válidos.  
4. Enviar requisição.  

Dados:  
{ "email": "usuario@email.com", "senha": "123456" }

Resultado Esperado:

- Status 200  
- Retorno de token de autenticação  

---

### CT-02  
Módulo: Autenticação  
Tipo: Negativo  

Pré-condição: Usuário cadastrado.

Passos:

1. Enviar requisição POST /login.  
2. Informar senha incorreta.  

Resultado Esperado:

- Status 401  
- Mensagem de erro: "Credenciais inválidas"  

---

# 🔹 MÓDULO: CADASTRO DE USUÁRIO


### CT-03  
Módulo: Cadastro de Usuário  
Tipo: Positivo  

Pré-condição: Nenhuma.

Passos:

1. Enviar requisição POST /usuarios.  
2. Informar dados válidos (nome, email, senha).  

Dados:  
{ "nome": "Usuario Teste", "email": "teste@email.com", "senha": "123456" }

Resultado Esperado:

- Status 201  
- Usuário criado com sucesso  

---

### CT-04  
Módulo: Cadastro de Usuário  
Tipo: Negativo  

Cenário: Cadastro com email já existente  

Passos:

1. Enviar POST /usuarios com email já cadastrado.  

Resultado Esperado:

- Status 400  
- Mensagem informando duplicidade  

---

### CT-05  
Módulo: Cadastro de Usuário  
Tipo: Negativo  

Cenário: Campos obrigatórios não preenchidos  

Passos:

1. Enviar POST /usuarios com campos vazios.  

Resultado Esperado:

- Status 400  
- Erro de validação  

---

# 🔹 MÓDULO: CADASTRO DE PRODUTO

### CT-06  
Módulo: Cadastro de Produto  
Tipo: Positivo  

Pré-condição: Usuário autenticado.

Passos:

1. Enviar POST /produtos.  
2. Informar dados válidos do produto.  

Dados:  
{ "nome": "Produto Teste", "preco": 50.0, "descricao": "Descrição teste" }

Resultado Esperado:

- Status 201  
- Produto criado com sucesso  

---

### CT-07  
Módulo: Cadastro de Produto  
Tipo: Negativo  

Cenário: Campos obrigatórios não preenchidos  

Passos:

1. Enviar POST /produtos com dados incompletos.  

Resultado Esperado:

- Status 400  

---

### CT-08  
Módulo: Cadastro de Produto  
Tipo: Negativo  

Cenário: Preço inválido (negativo ou zero)  

Passos:

1. Enviar POST /produtos com preço inválido.  

Resultado Esperado:

- Status 400  

---

### CT-09  
Módulo: Cadastro de Produto  
Tipo: Negativo  

Cenário: Usuário não autenticado  

Passos:

1. Enviar POST /produtos sem token de autenticação.  

Resultado Esperado:

- Status 401  

---

### CT-10  
Módulo: Cadastro de Produto  
Tipo: Positivo  

Cenário: Cadastro com dados válidos completos  

Passos:

1. Enviar POST /produtos com todos os dados corretos.  

Resultado Esperado:

- Produto salvo corretamente no banco  

---

# 🔹 TESTES ADICIONAIS


### CT-11  
Tipo: Negativo  

Cenário: Acesso a rota protegida sem token  

Passos:

1. Acessar endpoint protegido sem autenticação.  

Resultado Esperado:

- Status 401  

---

### CT-12  
Tipo: Positivo  

Cenário: Verificar dados após cadastro  

Passos:

1. Cadastrar produto.  
2. Consultar registros no sistema.  

Resultado Esperado:

- Registro refletido corretamente  