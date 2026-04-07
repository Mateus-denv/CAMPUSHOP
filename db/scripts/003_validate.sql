USE campushop;

SELECT 'usuarios' AS tabela, COUNT(*) AS total FROM usuarios
UNION ALL
SELECT 'produtos' AS tabela, COUNT(*) AS total FROM produtos
UNION ALL
SELECT 'carrinhos' AS tabela, COUNT(*) AS total FROM carrinhos
UNION ALL
SELECT 'itens_carrinho' AS tabela, COUNT(*) AS total FROM itens_carrinho
UNION ALL
SELECT 'pedidos' AS tabela, COUNT(*) AS total FROM pedidos
UNION ALL
SELECT 'itens_pedido' AS tabela, COUNT(*) AS total FROM itens_pedido;
