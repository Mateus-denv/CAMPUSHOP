USE campushop;

INSERT INTO tipo_pagamento (nome, descricao)
VALUES
  ('PIX', 'Pagamento instantâneo via PIX'),
  ('Cartão de Crédito', 'Pagamento com cartão de crédito'),
  ('Boleto', 'Pagamento via boleto bancário'),
  ('Dinheiro', 'Pagamento em dinheiro na entrega')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO usuario (
  nome_completo,
  ra,
  email,
  cidade,
  nome_cliente,
  senha,
  telefone,
  tipo_conta,
  cpf_cnpj,
  instituicao_ensino,
  localizacao_gps,
  ativado,
  data_cadastro
)
VALUES
  (
    'Maria Souza',
    '202400001',
    'maria@campushop.com',
    'Camaçari',
    'Maria Souza',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NULL,
    'comprador',
    NULL,
    'UFBA',
    NULL,
    1,
    CURRENT_DATE
  ),
  (
    'Joao Lima',
    '202400002',
    'joao@campushop.com',
    'Salvador',
    'Joao Lima',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NULL,
    'vendedor',
    NULL,
    'UFBA',
    NULL,
    1,
    CURRENT_DATE
  )
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO produto (nome_produto, descricao, estoque, preco, status, id_categoria)
SELECT 'Livro de Lógica de Programação', 'Livro para disciplinas iniciais', 3, 150.00, 'ATIVO', c.id_categoria
FROM categoria c
WHERE c.nome_categoria = 'Livros'
AND NOT EXISTS (
  SELECT 1
  FROM produto p
  WHERE p.nome_produto = 'Livro de Lógica de Programação'
)
LIMIT 1;
