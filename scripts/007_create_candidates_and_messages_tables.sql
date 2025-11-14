-- Tabela para armazenar informações dos candidatos
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  desired_role TEXT,
  years_of_experience INT,
  expected_salary TEXT,
  location TEXT,
  seniority TEXT,
  status TEXT DEFAULT 'novo',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar o histórico de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  candidate_phone TEXT NOT NULL REFERENCES candidates(phone) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'candidate' ou 'bot'
  text TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para a tabela 'candidates'
-- Permite que usuários autenticados leiam todos os candidatos
CREATE POLICY "Allow authenticated users to read candidates"
ON candidates
FOR SELECT
TO authenticated
USING (true);

-- Permite que o service_role (backend) crie, leia, atualize e delete candidatos
CREATE POLICY "Allow full access for service_role on candidates"
ON candidates
FOR ALL
TO service_role
USING (true);

-- Políticas de acesso para a tabela 'messages'
-- Permite que usuários autenticados leiam todas as mensagens
CREATE POLICY "Allow authenticated users to read messages"
ON messages
FOR SELECT
TO authenticated
USING (true);

-- Permite que o service_role (backend) crie, leia, atualize e delete mensagens
CREATE POLICY "Allow full access for service_role on messages"
ON messages
FOR ALL
TO service_role
USING (true);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_messages_candidate_phone ON messages(candidate_phone);
CREATE INDEX IF NOT EXISTS idx_candidates_phone ON candidates(phone);
