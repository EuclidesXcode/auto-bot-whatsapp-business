-- Adiciona a coluna 'is_read' na tabela de mensagens
ALTER TABLE messages
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Adiciona um índice para otimizar buscas por mensagens não lidas
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages (is_read);

-- Comentário sobre a nova coluna
COMMENT ON COLUMN messages.is_read IS 'Indica se a mensagem foi lida pelo recrutador. TRUE para lida, FALSE para não lida.';

-- Atualiza todas as mensagens existentes para serem consideradas 'lidas' para não poluir a UI com notificações antigas.
-- Mensagens de candidatos serão marcadas como lidas, novas mensagens de candidatos começarão como não lidas.
UPDATE messages SET is_read = TRUE;
