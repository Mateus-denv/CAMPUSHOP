USE campushop;

-- Garante rollback completo dos objetos de pedido criados no schema.
DROP TRIGGER IF EXISTS trg_pedido_gerar_chave_entrega;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS usuario;
