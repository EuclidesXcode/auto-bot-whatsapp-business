import { createClient } from "@supabase/supabase-js"

// Cuidado: Este cliente tem privilégios de administrador (service_role)
// e deve ser usado APENAS no lado do servidor, em ambientes seguros.
// Ele ignora todas as políticas de Row Level Security.

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase URL or Service Role Key are missing from environment variables.")
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
