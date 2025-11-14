import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("system_prompts")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("[v0] Erro ao buscar system prompt:", error)
      // Retornar prompt padrão se não encontrar no banco
      return NextResponse.json({
        content: `Você é um assistente de recrutamento amigável e profissional chamado RecrutaBot.

Sua missão é conduzir uma conversa natural com os candidatos para coletar as seguintes informações obrigatórias:
1. Nome completo
2. Cargo desejado
3. Anos de experiência na área
4. Expectativa salarial (faixa de valores)
5. Localização (cidade/estado ou preferência por trabalho remoto)
6. Link do LinkedIn ou portfólio online

DIRETRIZES DE CONVERSAÇÃO:
- Seja cordial, mas profissional
- Faça uma pergunta por vez para não sobrecarregar o candidato
- Use linguagem clara e direta em português brasileiro
- Se o candidato fornecer informações incompletas, peça gentilmente mais detalhes
- Confirme as informações importantes antes de prosseguir
- Ao final da coleta, agradeça e informe que um recrutador entrará em contato em breve

TOM DE VOZ:
- Profissional, mas acolhedor
- Claro e objetivo
- Positivo e encorajador

Lembre-se: você está representando a empresa, então mantenha sempre um tom respeitoso e profissional.`,
        updatedAt: new Date().toISOString(),
        updatedBy: "system",
      })
    }

    return NextResponse.json({
      content: data.content,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by,
    })
  } catch (error) {
    console.error("[v0] Erro ao buscar system prompt:", error)
    return NextResponse.json({ error: "Erro ao buscar system prompt" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { content, updatedBy } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Salvando system prompt no banco de dados...")

    await supabase.from("system_prompts").update({ is_active: false }).eq("is_active", true)

    const { data, error } = await supabase
      .from("system_prompts")
      .insert({
        content,
        updated_by: updatedBy || "admin@tria.com",
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao salvar system prompt:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] System prompt salvo com sucesso:", data.id)

    return NextResponse.json({
      success: true,
      data: {
        content: data.content,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
      },
    })
  } catch (error) {
    console.error("[v0] Erro ao atualizar system prompt:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao atualizar" }, { status: 500 })
  }
}
