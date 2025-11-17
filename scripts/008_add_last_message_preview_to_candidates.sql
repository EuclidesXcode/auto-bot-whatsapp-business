-- Adicionar a coluna last_message_preview que faltou no script 007
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;
