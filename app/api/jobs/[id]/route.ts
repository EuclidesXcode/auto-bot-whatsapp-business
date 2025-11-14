import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PUT - Atualizar vaga
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Verificar se o usuário é admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, seniority, location, required_skills, status } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (seniority !== undefined) updateData.seniority = seniority
    if (location !== undefined) updateData.location = location
    if (required_skills !== undefined) updateData.required_skills = required_skills
    if (status !== undefined) {
      updateData.status = status
      if (status === "closed") {
        updateData.closed_at = new Date().toISOString()
      }
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao atualizar vaga:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("[v0] Erro ao atualizar vaga:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Deletar vaga
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Verificar se o usuário é admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { error } = await supabase.from("jobs").delete().eq("id", params.id)

    if (error) {
      console.error("[v0] Erro ao deletar vaga:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro ao deletar vaga:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
