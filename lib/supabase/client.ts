import { createBrowserClient } from "@supabase/ssr"

// NOTE: O padrão singleton foi removido daqui.
// A biblioteca @supabase/ssr foi projetada para que uma nova instância seja criada
// quando necessário, evitando problemas de estado de autenticação entre requisições e usuários.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
