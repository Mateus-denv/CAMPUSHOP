USE campushop;

SELECT 'usuario' AS tabela, COUNT(*) AS total FROM usuario
UNION ALL
SELECT 'categoria' AS tabela, COUNT(*) AS total FROM categoria
UNION ALL
SELECT 'produto' AS tabela, COUNT(*) AS total FROM produto;

SELECT 'usuarios_duplicados_email' AS validacao, COUNT(*) AS total
FROM (
	SELECT email
	FROM usuario
	GROUP BY email
	HAVING COUNT(*) > 1
) d;

SELECT 'usuarios_duplicados_ra' AS validacao, COUNT(*) AS total
FROM (
	SELECT ra
	FROM usuario
	GROUP BY ra
	HAVING COUNT(*) > 1
) d;

SELECT 'categorias_duplicadas_nome' AS validacao, COUNT(*) AS total
FROM (
	SELECT nome_categoria
	FROM categoria
	GROUP BY nome_categoria
	HAVING COUNT(*) > 1
) d;
