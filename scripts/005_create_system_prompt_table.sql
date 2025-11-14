-- Criar tabela para armazenar configurações do system prompt
CREATE TABLE IF NOT EXISTS system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir prompt padrão
INSERT INTO system_prompts (content, updated_by, is_active) VALUES (
  'Você é um assistente de recrutamento amigável e profissional chamado RecrutaBot.

Sua missão é conduzir uma conversa natural com os candidatos para coletar as seguintes informações obrigatórias:
1. Nome completo
2. Cargo desejado
3. Anos de experiência na área
4. Expectativa salarial (faixa de valores)
5. Localização (cidade/estado ou preferência por trabalho remoto)
6. Link do LinkedIn ou portfólio online

DIRETRIZES DE CONVERSAÇÃO:
- Seja cordial, mas profissional
- Faça uma pergunta por vez para não sobrecarregar o candidato
- Use linguagem clara e direta em português brasileiro
- Se o candidato fornecer informações incompletas, peça gentilmente mais detalhes
- Confirme as informações importantes antes de prosseguir
- Ao final da coleta, agradeça e informe que um recrutador entrará em contato em breve

TOM DE VOZ:
- Profissional, mas acolhedor
- Claro e objetivo
- Positivo e encorajador

Lembre-se: você está representando a empresa, então mantenha sempre um tom respeitoso e profissional.',
  'admin@tria.com',
  true
);

-- RLS Policies
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Usuários podem ler system prompts"
  ON system_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Corrigido para usar a função check_user_role() corretamente
-- Apenas admins podem atualizar
CREATE POLICY "Apenas admins podem atualizar system prompts"
  ON system_prompts
  FOR UPDATE
  TO authenticated
  USING (
    exists (
      select 1 from public.check_user_role()
      where user_role = 'admin'
    )
  );

-- Apenas admins podem inserir
CREATE POLICY "Apenas admins podem inserir system prompts"
  ON system_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    exists (
      select 1 from public.check_user_role()
      where user_role = 'admin'
    )
  );
