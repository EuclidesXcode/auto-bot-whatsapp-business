-- Habilita RLS para a tabela de mensagens, se ainda não estiver habilitado
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas para evitar duplicatas
DROP POLICY IF EXISTS "Allow authenticated users to read messages" ON messages;

-- Cria a nova política de leitura
CREATE POLICY "Allow authenticated users to read messages"
ON messages
FOR SELECT
TO authenticated
USING (true);

-- Comentário sobre a política
COMMENT ON POLICY "Allow authenticated users to read messages" ON messages IS 
'Permite que qualquer usuário autenticado leia todas as mensagens para popular as conversas.';
