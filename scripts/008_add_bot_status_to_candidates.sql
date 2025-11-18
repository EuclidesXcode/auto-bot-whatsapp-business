ALTER TABLE candidates
ADD COLUMN bot_status TEXT DEFAULT 'active';

COMMENT ON COLUMN candidates.bot_status IS 'Controla se o bot deve responder ativamente ao candidato. Valores: active, inactive.';
