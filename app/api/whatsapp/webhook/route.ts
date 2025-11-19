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
    console.log("[Webhook] Corpo do webhook recebido:", JSON.stringify(body, null, 2))

    // Processar status de mensagem
    if (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]) {
      const status = body.entry[0].changes[0].value.statuses[0]
      console.log("[Webhook] Status da mensagem recebido:", status)
      return NextResponse.json({ success: true, message: "Status recebido" })
    }

    // Processar mensagem de usuário
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (message) {
      const contact = body.entry[0].changes[0].value.contacts[0]
      const phone = message.from
      const name = contact?.profile?.name || "Candidato"
      const messageId = message.id
      const timestamp = new Date(Number.parseInt(message.timestamp) * 1000).toISOString()

      // Garante que o candidato exista
      await updateOrCreateCandidate(phone, name)

      // VERIFICAÇÃO: O bot deve responder a este candidato?
      const candidate = await getCandidate(phone)
      if (candidate?.bot_status === "inactive") {
        console.log(`[Webhook] Bot inativo para ${phone}. Ignorando mensagem.`)
        return NextResponse.json({ success: true, message: "Bot inativo para este usuário" })
      }

      // Roteamento baseado no tipo de mensagem
      if (message.type === "text") {
        const text = message.text?.body || ""
        console.log("[Webhook] Mensagem de texto recebida:", { phone, text })

        await addMessageToConversation(phone, { id: messageId, sender: "candidate", text, timestamp })
        const aiResponse = await processMessageWithAI(phone, text, name)

        if (aiResponse) {
          await sendWhatsAppMessage(phone, aiResponse)
        }
      } else if (message.type === "document") {
        const document = message.document
        const allowedMimeTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
          "text/csv",
        ]

        console.log(`[Webhook] Documento recebido: ${document.filename} (${document.mime_type})`)

        if (allowedMimeTypes.includes(document.mime_type)) {
          // Salva no histórico que o currículo foi enviado
          await addMessageToConversation(phone, {
            id: messageId,
            sender: "candidate",
            text: `[Arquivo] Currículo enviado: ${document.filename}`,
            timestamp,
          })

          // Confirma o recebimento para o usuário
          await sendWhatsAppMessage(phone, "Recebi seu currículo! Vou analisá-lo e em breve te dou um retorno.")

          // Dispara o processamento em segundo plano (fire-and-forget)
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resumes/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mediaId: document.id,
              mimeType: document.mime_type,
              filename: document.filename,
              candidatePhone: phone,
            }),
          }).catch((err) => {
            console.error("[Webhook] Erro ao disparar processamento do currículo:", err)
          })
        } else {
          await sendWhatsAppMessage(
            phone,
            "Formato de arquivo não suportado. Por favor, envie seu currículo em PDF, XLSX ou CSV."
          )
        }
      } else {
        console.log(`[Webhook] Tipo de mensagem não suportado: ${message.type}`)
        await sendWhatsAppMessage(phone, "Desculpe, só consigo processar mensagens de texto ou documentos (PDF, XLSX, CSV).")
      }

      return NextResponse.json({ success: true })
    }

    console.log("[Webhook] Evento não processado:", body)
    return NextResponse.json({ success: true, message: "Evento não processado" })
  } catch (error) {
    console.error("[Webhook] Erro catastrófico:", error)
    return NextResponse.json({ error: "Erro ao processar mensagem" }, { status: 500 })
  }
}
