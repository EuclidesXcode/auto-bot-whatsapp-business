import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/service"

interface RouteParams {
  params: {
    id: string // Corresponde ao [id] na estrutura de pastas, que será o phone do candidato
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const phone = params.id

  if (!phone) {
    return NextResponse.json({ error: "ID do candidato (telefone) é obrigatório" }, { status: 400 })
  }

  console.log(`[API] Marcando mensagens como lidas para o candidato: ${phone}`)

  try {
    const { error } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("candidate_phone", phone)
      .eq("sender", "candidate") // Marca apenas as mensagens do candidato como lidas

    if (error) {
      console.error("[API] Erro ao marcar mensagens como lidas:", error)
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true, message: "Mensagens marcadas como lidas." })
  } catch (error) {
    console.error("[API] Erro catastrófico ao marcar mensagens como lidas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor ao marcar mensagens como lidas" },
      { status: 500 }
    )
  }
}
