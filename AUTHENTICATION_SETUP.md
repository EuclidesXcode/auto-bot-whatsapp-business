# 🔐 Guia de Configuração de Autenticação - Tria+

## Passo 1: Criar a Tabela de Usuários

Execute o script SQL no v0:
- Vá para a aba de **Scripts** no v0
- Execute `scripts/001_create_users_table.sql`
- Isso criará a tabela `users` com Row Level Security (RLS)

## Passo 2: Criar o Primeiro Administrador

Acesse a página de setup:
\`\`\`
/auth/setup
\`\`\`

Preencha o formulário com:
- **Nome completo**: Seu nome
- **Email**: Seu email (ex: admin@tria.com)
- **Senha**: Uma senha forte (mínimo 8 caracteres)

Clique em **"Criar Administrador"** e o sistema irá:
1. ✅ Criar o usuário no Supabase Auth
2. ✅ Adicionar o registro na tabela `users` com role `admin`
3. ✅ Fazer login automaticamente
4. ✅ Redirecionar para o painel

## Passo 3: Fazer Login

Depois de criar o admin, use a página de login:
\`\`\`
/auth/login
\`\`\`

Faça login com o email e senha que você criou.

## Gerenciamento de Usuários

Apenas administradores podem:
- Acessar o menu **"Usuários"** no painel
- Criar novos usuários (admin ou recrutador)
- Editar ou remover usuários existentes

## 🔒 Níveis de Acesso

### Administrador
- Visualizar e gerenciar candidatos
- Visualizar e gerenciar vagas
- Configurar System Prompt do chatbot
- **Gerenciar usuários** (criar, editar, excluir)
- Configurar webhook do WhatsApp

### Recrutador
- Visualizar e gerenciar candidatos
- Visualizar e gerenciar vagas
- Ver configuração do chatbot (apenas leitura)
- ❌ Não pode gerenciar outros usuários

## Credenciais Padrão Sugeridas

- **Email**: admin@tria.com
- **Senha**: Admin@123456 (ou qualquer senha forte)

⚠️ **Importante**: Após o primeiro login, altere sua senha!

## Segurança

- A página `/auth/setup` só permite criar o primeiro admin
- Após criar o primeiro admin, a rota retornará erro
- Todos os endpoints protegidos exigem autenticação
- Row Level Security (RLS) está ativado no Supabase
- Senhas são criptografadas pelo Supabase Auth

## Troubleshooting

**Erro "Email já existe":**
- O email já foi registrado no Supabase Auth
- Use outro email ou faça login com esse email

**Erro "Tabela users não existe":**
- Execute o script `001_create_users_table.sql` primeiro

**Loop de redirecionamento:**
- Limpe o cache do navegador (Ctrl + Shift + Del)
- Tente em uma aba anônima

**Não consigo acessar /auth/setup:**
- Verifique se já existe um admin criado
- A página só permite criar o primeiro admin por segurança
</parameter>
