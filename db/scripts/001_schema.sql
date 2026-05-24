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
  visivel_para_comprador TINYINT(1) NOT NULL DEFAULT 1,
  dimensoes VARCHAR(255),
  peso DOUBLE,
  -- Guarda o dono (vendedor) do produto para permitir derivar id_vendedor no pedido.
  id_usuario INT NOT NULL,
  id_categoria INT,
  CONSTRAINT fk_produto_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- Mantém a reserva do carrinho persistida por usuário e produto, com quantidade válida.
CREATE TABLE IF NOT EXISTS carrinho (
  id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL,
  data_adicao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carrinho_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
  CONSTRAINT fk_carrinho_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE CASCADE,
  CONSTRAINT uk_carrinho_usuario_produto UNIQUE (id_usuario, id_produto),
  CONSTRAINT chk_carrinho_quantidade CHECK (quantidade > 0)
);

-- Tabela de pedidos com chave de entrega unica e status controlado do fluxo de aprovacao.
CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_vendedor INT NOT NULL,
  chave_entrega VARCHAR(8) UNIQUE,
  valor_pedido DECIMAL(10,2) NOT NULL,
  status_pedido ENUM('aceito', 'rejeitado', 'em analise', 'invalido') NOT NULL DEFAULT 'em analise',
  motivo_rejeicao VARCHAR(255),
  data_aprovacao DATETIME,
  prazo_entrega_limite DATETIME,
  data_entrega DATETIME,
  data_invalidacao DATETIME,
  data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  -- Vincula o vendedor dono do produto negociado para rastreabilidade do pedido.
  CONSTRAINT fk_pedido_vendedor FOREIGN KEY (id_vendedor) REFERENCES usuario(id),
  CONSTRAINT chk_pedido_chave_formato CHECK (chave_entrega REGEXP '^[A-Z][0-9][A-Z][0-9][A-Z][0-9]{3}$')
);

-- Itens do pedido para registrar cada produto negociado dentro da mesma compra.
CREATE TABLE IF NOT EXISTS pedido_item (
  id_pedido_item INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_pedido_item_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_pedido_item_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
  CONSTRAINT chk_pedido_item_quantidade CHECK (quantidade > 0)
);

-- A aplicação gera a chave somente após a aprovação do vendedor, então o banco não precisa mais de trigger.
