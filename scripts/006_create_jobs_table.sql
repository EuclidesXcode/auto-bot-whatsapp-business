-- Criar função check_user_role se não existir
-- Esta função bypassa RLS para verificar o papel do usuário
CREATE OR REPLACE FUNCTION public.check_user_role()
RETURNS TABLE(user_id uuid, user_role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, role FROM public.users WHERE id = auth.uid();
$$;

-- Criar tabela de vagas (jobs)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  seniority TEXT NOT NULL CHECK (seniority IN ('Júnior', 'Pleno', 'Sênior', 'Especialista')),
  location TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);

-- Habilitar RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem visualizar vagas" ON jobs;
DROP POLICY IF EXISTS "Apenas admins podem criar vagas" ON jobs;
DROP POLICY IF EXISTS "Apenas admins podem atualizar vagas" ON jobs;
DROP POLICY IF EXISTS "Apenas admins podem deletar vagas" ON jobs;

-- Políticas RLS
-- Todos podem visualizar vagas
CREATE POLICY "Todos podem visualizar vagas"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem criar vagas
CREATE POLICY "Apenas admins podem criar vagas"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM check_user_role() WHERE user_role = 'admin'
    )
  );

-- Apenas admins podem atualizar vagas
CREATE POLICY "Apenas admins podem atualizar vagas"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM check_user_role() WHERE user_role = 'admin'
    )
  );

-- Apenas admins podem deletar vagas
CREATE POLICY "Apenas admins podem deletar vagas"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM check_user_role() WHERE user_role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;

-- Trigger para atualizar updated_at
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();
