import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt } = await request.json()

    if (!message || !systemPrompt) {
      return NextResponse.json({ error: "Mensagem e system prompt são obrigatórios" }, { status: 400 })
    }

    console.log("[v0] Testando bot com prompt:", systemPrompt.substring(0, 100) + "...")
    console.log("[v0] Mensagem do usuário:", message)

    // Gera resposta usando o AI SDK
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
    })

    console.log("[v0] Resposta gerada:", text.substring(0, 100) + "...")

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("[v0] Erro ao testar bot:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar resposta",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
