import { NextResponse } from "next/server"
import { getConversations } from "@/lib/whatsapp-service"

export async function GET() {
  try {
    const conversations = await getConversations()
    return NextResponse.json(conversations)
  } catch (error) {
    console.error("[v0] Erro ao buscar conversas:", error)
    return NextResponse.json({ error: "Erro ao buscar conversas" }, { status: 500 })
  }
}
