import { type NextRequest, NextResponse } from "next/server"
import {
  updateOrCreateCandidate,
  addMessageToConversation,
  sendWhatsAppMessage,
  getCandidate,
} from "@/lib/whatsapp-service"
import { processMessageWithAI } from "@/lib/ai-service"

// Verificação do webhook (necessário para Meta configurar o webhook)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  console.log("[v0] Tentativa de verificação do webhook:", { mode, token, challenge })

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[v0] ✅ Webhook verificado com sucesso!")
    return new NextResponse(challenge, { status: 200 })
  }

  console.log("[v0] ❌ Verificação falhou - token não corresponde")
  return NextResponse.json({ error: "Verificação falhou" }, { status: 403 })
}

// Receber mensagens do WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Webhook recebido:", JSON.stringify(body, null, 2))

    // Verificar se há mensagens
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0]
      const contact = body.entry[0].changes[0].value.contacts[0]
      const phone = message.from

      // VERIFICAÇÃO: O bot deve responder a este candidato?
      const candidate = await getCandidate(phone)
      if (candidate?.bot_status === "inactive") {
        console.log(`[Webhook] Bot inativo para ${phone}. Ignorando mensagem.`)
        return NextResponse.json({ success: true, message: "Bot inativo para este usuário" })
      }

      const text = message.text?.body || ""
      const name = contact?.profile?.name || "Candidato"
      const messageId = message.id
      const timestamp = new Date(Number.parseInt(message.timestamp) * 1000).toISOString()

      console.log("[Webhook] Nova mensagem recebida:", { phone, text, name })

      // Salvar mensagem do candidato
      console.log("[Webhook] Passo 1: Salvando mensagem do candidato...")
      await addMessageToConversation(phone, {
        id: messageId,
        sender: "candidate",
        text,
        timestamp,
      })
      console.log("[Webhook] Passo 1 concluído.")

      // Atualizar ou criar candidato
      console.log("[Webhook] Passo 2: Atualizando/criando candidato...")
      await updateOrCreateCandidate(phone, name)
      console.log("[Webhook] Passo 2 concluído.")

      // Processar mensagem com IA e responder
      console.log("[Webhook] Passo 3: Processando com IA...")
      const aiResponse = await processMessageWithAI(phone, text, name)
      console.log("[Webhook] Passo 3 concluído.")

      if (aiResponse) {
        console.log("[Webhook] Passo 4: Enviando resposta da IA...")
        await sendWhatsAppMessage(phone, aiResponse)
        console.log("[Webhook] Passo 4 concluído.")
      } else {
        console.log("[Webhook] Nenhuma resposta gerada pela IA.")
      }

      return NextResponse.json({ success: true })
    }

    // Status de mensagem (enviada, entregue, lida)
    if (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]) {
      const status = body.entry[0].changes[0].value.statuses[0]
      console.log("[v0] Status da mensagem:", status)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro ao processar mensagem" }, { status: 500 })
  }
}
