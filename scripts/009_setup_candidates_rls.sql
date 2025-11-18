-- Habilita RLS para a tabela de candidatos, se ainda não estiver habilitado
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas de SELECT para evitar duplicatas
DROP POLICY IF EXISTS "Allow authenticated users to read candidates" ON candidates;

-- Cria a nova política
CREATE POLICY "Allow authenticated users to read candidates"
ON candidates
FOR SELECT
TO authenticated
USING (true);

-- Comentário sobre a política
COMMENT ON POLICY "Allow authenticated users to read candidates" ON candidates IS 
'Permite que qualquer usuário autenticado (seja admin ou recruiter) leia os dados de todos os candidatos.';
