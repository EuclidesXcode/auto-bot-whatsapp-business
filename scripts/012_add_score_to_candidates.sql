-- Adiciona as colunas score e score_justification na tabela candidates
ALTER TABLE public.candidates
ADD COLUMN score INTEGER,
ADD COLUMN score_justification TEXT;

-- Adiciona uma restrição para garantir que o score esteja entre 1 e 10, se não for nulo
ALTER TABLE public.candidates
ADD CONSTRAINT score_check CHECK (score IS NULL OR (score >= 1 AND score <= 10));

-- Comentários para documentar as novas colunas
COMMENT ON COLUMN public.candidates.score IS 'Pontuação do candidato para a vaga, gerada pela IA (1-10).';
COMMENT ON COLUMN public.candidates.score_justification IS 'Justificativa da pontuação gerada pela IA.';
