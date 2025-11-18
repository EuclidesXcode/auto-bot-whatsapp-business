import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard-client"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // O middleware já garante que o usuário está autenticado.
  // Se, por algum motivo, o usuário não existir aqui, é uma situação inesperada.
  // A melhor abordagem é redirecionar, mas sem a lógica complexa de signOut.
  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  console.log("--- User Profile Check ---");
  console.log("Authenticated User ID:", user.id);
  console.log("Fetched User Data:", userData);
  console.log("Fetch Error:", userError);
  console.log("--------------------------");

  // Se não encontrar dados do usuário na tabela 'users', pode ser um estado
  // intermediário (ex: usuário recém-criado). Redirecionar para o setup
  // ou mostrar uma mensagem pode ser uma opção. Redirecionamos para o setup.
  if (userError || !userData) {
    redirect("/auth/setup")
  }

  return <DashboardClient user={userData} />
}
