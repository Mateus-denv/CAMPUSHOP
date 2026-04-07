USE campushop;

INSERT INTO usuarios (nome_completo, ra, email, senha, instituicao, cidade, perfil)
VALUES
  ('Maria Souza', '202400001', 'maria@campushop.com', 'senha_hash_demo', 'UFBA', 'Camaçari', 'ESTUDANTE'),
  ('Joao Lima', '202400002', 'joao@campushop.com', 'senha_hash_demo', 'UFBA', 'Salvador', 'ESTUDANTE')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO produtos (nome, descricao, preco, estoque, vendedor_id)
SELECT 'Livro de Lógica de Programação', 'Livro para disciplinas iniciais', 150.00, 3, u.id
FROM usuarios u
WHERE u.email = 'maria@campushop.com'
LIMIT 1;
