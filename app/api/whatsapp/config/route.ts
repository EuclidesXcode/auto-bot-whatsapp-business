import { NextResponse } from "next/server"

export async function GET() {
  try {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || ""

    return NextResponse.json({
      success: true,
      verifyToken,
    })
  } catch (error) {
    console.error("[v0] Erro ao buscar configuração:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar configuração" }, { status: 500 })
  }
}
