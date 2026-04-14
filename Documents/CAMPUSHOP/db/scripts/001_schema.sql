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
  CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);
