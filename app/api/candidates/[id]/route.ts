import { NextResponse } from "next/server"
import { deleteCandidate } from "@/lib/whatsapp-service"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const success = await deleteCandidate(id)

    if (!success) {
      return NextResponse.json(
        { error: "Falha ao deletar candidato ou candidato não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro ao deletar candidato:", error)
    return NextResponse.json({ error: "Erro ao deletar candidato" }, { status: 500 })
  }
}
