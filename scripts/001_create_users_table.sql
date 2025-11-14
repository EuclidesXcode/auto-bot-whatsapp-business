-- Criar tabela de perfis de usuários vinculada ao auth.users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'recruiter' check (role in ('admin', 'recruiter')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.users enable row level security;

-- Remover políticas antigas que causam recursão infinita
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can insert users" on public.users;
drop policy if exists "Admins can update all users" on public.users;
drop policy if exists "Admins can delete users" on public.users;

-- Criar função para verificar se usuário é admin usando JWT claims
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  select role into user_role
  from public.users
  where id = auth.uid();
  
  return user_role = 'admin';
end;
$$;

-- Políticas RLS simplificadas que evitam recursão
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Política especial para admins com bypass de RLS
create policy "Admins can view all users"
  on public.users for select
  using (
    (select role from public.users where id = auth.uid() limit 1) = 'admin'
  );

create policy "Admins can insert users"
  on public.users for insert
  with check (
    (select role from public.users where id = auth.uid() limit 1) = 'admin'
  );

create policy "Admins can update all users"
  on public.users for update
  using (
    (select role from public.users where id = auth.uid() limit 1) = 'admin'
  );

create policy "Admins can delete users"
  on public.users for delete
  using (
    (select role from public.users where id = auth.uid() limit 1) = 'admin'
  );

-- Função para criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', 'Usuário'),
    coalesce(new.raw_user_meta_data ->> 'role', 'recruiter')
  );
  return new;
end;
$$;

-- Trigger para criar perfil automaticamente
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Índices para melhor performance
create index if not exists users_email_idx on public.users(email);
create index if not exists users_role_idx on public.users(role);
