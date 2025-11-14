import { NextResponse } from "next/server"
import { getCandidates } from "@/lib/whatsapp-service"

export async function GET() {
  try {
    const candidates = await getCandidates()
    return NextResponse.json(candidates)
  } catch (error) {
    console.error("[v0] Erro ao buscar candidatos:", error)
    return NextResponse.json({ error: "Erro ao buscar candidatos" }, { status: 500 })
  }
}
