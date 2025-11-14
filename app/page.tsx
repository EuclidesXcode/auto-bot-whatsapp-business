import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard-client"

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Se houver erro de sessão ou usuário não existir, limpar e redirecionar
  if (error || !user) {
    // Tentar fazer signOut para limpar sessão inválida
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignorar erros no signOut
    }
    redirect("/auth/login")
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  // Se não encontrar dados do usuário, limpar sessão e redirecionar
  if (userError || !userData) {
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignorar erros no signOut
    }
    redirect("/auth/login")
  }

  return <DashboardClient user={userData} />
}
