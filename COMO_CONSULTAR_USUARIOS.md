# Como Consultar Usuários do Sistema Tria+

## Método 1: Via Script SQL (Recomendado quando não logado)

Execute o script `scripts/view_users.sql` no v0 para ver todos os usuários cadastrados.

O resultado mostrará:
- **id**: UUID do usuário
- **email**: Email de login
- **name**: Nome do usuário
- **role**: Função (admin ou recruiter)
- **created_at**: Data de criação

**Nota importante**: O script mostra apenas o EMAIL, não a SENHA. As senhas são criptografadas pelo Supabase Auth e não podem ser visualizadas.

## Método 2: Resetar Senha

Se você esqueceu a senha do admin:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication** → **Users**
3. Encontre o usuário admin
4. Clique nos 3 pontos → **Reset Password**
5. Copie o link de reset e acesse
6. Defina uma nova senha

## Método 3: Criar Novo Admin

Se preferir criar um novo admin:

1. Delete o usuário existente no Supabase Dashboard
2. Acesse `/auth/setup` novamente
3. Crie um novo admin com email e senha de sua escolha

## Lembrar Credenciais

Recomendamos anotar as credenciais em um local seguro após criar o admin:
- Email usado no cadastro
- Senha definida (mínimo 6 caracteres)
</parameter>
