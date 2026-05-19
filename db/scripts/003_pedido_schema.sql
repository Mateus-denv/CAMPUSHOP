USE campushop;

CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  endereco VARCHAR(255),
  telefone VARCHAR(50),
  total DOUBLE NOT NULL,
  criado_em DATETIME,
  atualizado_em DATETIME,
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS pedido_item (
  id_pedido_item INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DOUBLE NOT NULL,
  CONSTRAINT fk_pedido_item_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  CONSTRAINT fk_pedido_item_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);
