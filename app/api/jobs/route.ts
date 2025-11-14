import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar todas as vagas
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(`
        *,
        created_by_user:users!jobs_created_by_fkey(name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Erro ao buscar vagas:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Contar candidatos por vaga (temporário - será implementado quando tivermos tabela de candidatos)
    const jobsWithCount = jobs.map((job) => ({
      ...job,
      candidateCount: 0, // Placeholder
    }))

    return NextResponse.json(jobsWithCount)
  } catch (error) {
    console.error("[v0] Erro ao buscar vagas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar nova vaga
export async function POST(request: Request) {
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
    const { title, description, seniority, location, required_skills } = body

    if (!title || !description || !seniority || !location) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        title,
        description,
        seniority,
        location,
        required_skills: required_skills || [],
        created_by: user.id,
        status: "open",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao criar vaga:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("[v0] Erro ao criar vaga:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
