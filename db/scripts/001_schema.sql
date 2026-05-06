CREATE DATABASE IF NOT EXISTS campushop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campushop;

CREATE TABLE IF NOT EXISTS usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  ra VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  cidade VARCHAR(100),
  nome_cliente VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(15),
  tipo_conta VARCHAR(20),
  cpf_cnpj VARCHAR(20),
  instituicao_ensino VARCHAR(100),
  localizacao_gps VARCHAR(50),
  ativado TINYINT(1) NOT NULL DEFAULT 1,
  data_cadastro DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nome_categoria VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS produto (
  id_produto INT AUTO_INCREMENT PRIMARY KEY,
  nome_produto VARCHAR(200) NOT NULL,
  descricao TEXT,
  estoque INT NOT NULL,
  preco DOUBLE NOT NULL,
  status VARCHAR(20),
  dimensoes VARCHAR(255),
  peso DOUBLE,
  id_categoria INT,
  id_usuario INT,
  CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
  CONSTRAINT fk_produto_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS carrinho (
  id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL,
  data_adicao DATETIME,
  CONSTRAINT fk_carrinho_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  CONSTRAINT fk_carrinho_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE IF NOT EXISTS tipo_pagamento (
  id_tipo_pagamento INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  data_pedido DATE NOT NULL,
  valor_total DOUBLE NOT NULL,
  status_pedido VARCHAR(20) NOT NULL,
  id_cliente INT NOT NULL,
  id_tipo_pagamento INT,
  CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES usuario(id),
  CONSTRAINT fk_pedido_tipo_pagamento FOREIGN KEY (id_tipo_pagamento) REFERENCES tipo_pagamento(id_tipo_pagamento)
);

CREATE TABLE IF NOT EXISTS pedido_item (
  id_pedido_item INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DOUBLE NOT NULL,
  subtotal DOUBLE NOT NULL,
  CONSTRAINT fk_pedido_item_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  CONSTRAINT fk_pedido_item_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);
