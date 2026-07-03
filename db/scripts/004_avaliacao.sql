-- Script de migração para adicionar funcionalidade de avaliação de produtos
-- Data: 2024
-- Descrição: Cria tabela para armazenar avaliações de produtos (ratings e feedback)

USE campushop;

-- Criação da tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacao (
  id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
  id_produto INT NOT NULL,
  id_usuario INT NOT NULL,
  nota INT NOT NULL,
  feedback VARCHAR(500),
  data_avaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
  
  -- Índices para melhorar performance nas buscas mais comuns
  INDEX idx_avaliacao_produto (id_produto),
  INDEX idx_avaliacao_usuario (id_usuario),
  INDEX idx_avaliacao_status (status),
  INDEX idx_avaliacao_data (data_avaliacao),
  
  -- Foreign keys para garantir integridade referencial
  CONSTRAINT fk_avaliacao_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE CASCADE,
  CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
  
  -- Constraints para validação de dados
  CONSTRAINT chk_avaliacao_nota CHECK (nota >= 1 AND nota <= 10),
  CONSTRAINT chk_avaliacao_feedback_tamanho CHECK (CHAR_LENGTH(COALESCE(feedback, '')) <= 500),
  
  -- Garante que um usuário só possa avaliar um produto uma vez (com avaliação ativa)
  CONSTRAINT uk_avaliacao_usuario_produto UNIQUE (id_produto, id_usuario, status)
);

-- Comentários descritivos das colunas para documentação
ALTER TABLE avaliacao 
  MODIFY COLUMN nota INT NOT NULL COMMENT 'Nota do produto de 1 a 10 estrelas',
  MODIFY COLUMN feedback VARCHAR(500) COMMENT 'Feedback do comprador sobre o produto (máximo 500 caracteres)',
  MODIFY COLUMN data_avaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da criação da avaliação',
  MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ATIVA' COMMENT 'Status da avaliação: ATIVA ou INATIVA (soft delete)';

-- Log de sucesso
SELECT 'Tabela avaliacao criada com sucesso' AS resultado;
