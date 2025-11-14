-- Script para corrigir recursão infinita nas políticas RLS
-- Este script pode ser executado se você já tem a tabela criada

-- Remover políticas antigas que causam recursão
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can insert users" on public.users;
drop policy if exists "Admins can update all users" on public.users;
drop policy if exists "Admins can delete users" on public.users;

-- Políticas RLS corrigidas que evitam recursão
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Políticas para admins usando subquery com LIMIT para evitar recursão
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
