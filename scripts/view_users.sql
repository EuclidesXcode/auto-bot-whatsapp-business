-- Consultar todos os usuários cadastrados
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
ORDER BY created_at DESC;
