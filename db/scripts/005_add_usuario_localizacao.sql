-- Migração: adiciona campos de localização ao usuário
-- Use este script para atualizar a base MySQL do CampusShop

ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS estado VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cep VARCHAR(20),
  ADD COLUMN IF NOT EXISTS endereco VARCHAR(255),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE,
  ADD COLUMN IF NOT EXISTS ultima_atualizacao_localizacao DATETIME;

-- OBS: a coluna 'cidade' já existe no modelo original e não é alterada aqui.
