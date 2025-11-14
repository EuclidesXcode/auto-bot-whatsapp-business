-- Solução definitiva para recursão infinita nas políticas RLS
-- Esta abordagem usa uma função com SECURITY DEFINER que bypassa RLS

-- Remover políticas antigas
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can insert users" on public.users;
drop policy if exists "Admins can update all users" on public.users;
drop policy if exists "Admins can delete users" on public.users;

-- Remover função antiga se existir
drop function if exists public.is_admin();

-- Criar função que bypassa RLS para verificar se usuário é admin
create or replace function public.check_user_role()
returns table(user_id uuid, user_role text)
language sql
security definer
set search_path = public
stable
as $$
  select id, role from public.users where id = auth.uid();
$$;

-- Políticas para usuários normais (sem recursão)
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Políticas para admins usando a função que bypassa RLS
create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.check_user_role()
      where user_role = 'admin'
    )
  );

create policy "Admins can insert users"
  on public.users for insert
  with check (
    exists (
      select 1 from public.check_user_role()
      where user_role = 'admin'
    )
  );

create policy "Admins can update all users"
  on public.users for update
  using (
    exists (
      select 1 from public.check_user_role()
      where user_role = 'admin'
    )
  );

create policy "Admins can delete users"
  on public.users for delete
  using (
    exists (
      select 1 from public.check_user_role()
      where user_role = 'admin'
    )
  );
