import { type NextRequest, NextResponse } from "next/server"
import { sendWhatsAppMessage } from "@/lib/whatsapp-service"

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Parâmetros obrigatórios: to, message" }, { status: 400 })
    }

    const success = await sendWhatsAppMessage(to, message, "recruiter")

    if (success) {
      return NextResponse.json({ success: true, message: "Mensagem enviada com sucesso" })
    } else {
      return NextResponse.json({ error: "Falha ao enviar mensagem" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Erro na rota de envio:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
