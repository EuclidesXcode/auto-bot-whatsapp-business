import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/service"
import { generateText } from "ai"
import type { Job, Candidate, Message } from "@/lib/types"

// Helper para buscar dados com tratamento de erro
async function fetchJob(jobId: string): Promise<Job | null> {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single()
  if (error) console.error(`[API-SCORE] Erro ao buscar vaga ${jobId}:`, error)
  return data
}

async function fetchCandidate(candidateId: string): Promise<Candidate | null> {
  const { data, error } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single()
  if (error) console.error(`[API-SCORE] Erro ao buscar candidato ${candidateId}:`, error)
  return data
}

async function fetchConversation(phone: string): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("candidate_phone", phone)
    .order("timestamp", { ascending: true })
  if (error) console.error(`[API-SCORE] Erro ao buscar conversa para ${phone}:`, error)
  return data || []
}

export async function POST(request: Request) {
  try {
    const { candidateId, jobId } = await request.json()

    if (!candidateId || !jobId) {
      return NextResponse.json({ error: "candidateId e jobId são obrigatórios" }, { status: 400 })
    }

    // 1. Buscar dados da vaga e do candidato em paralelo
    const [job, candidate] = await Promise.all([
      fetchJob(jobId),
      fetchCandidate(candidateId),
    ])

    if (!job) {
      return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 })
    }
    if (!candidate) {
      return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 })
    }

    const conversation = await fetchConversation(candidate.phone)
    if (conversation.length === 0) {
      return NextResponse.json({ error: "Conversa não encontrada ou vazia" }, { status: 404 })
    }

    // 2. Montar o prompt para a IA
    const systemPrompt = `Você é um recrutador técnico sênior e especialista em análise de talentos. Sua tarefa é avaliar um candidato para uma vaga específica com base nos dados fornecidos.

Analise o perfil do candidato e a transcrição da entrevista com o bot. Compare as informações com os requisitos da vaga.

Sua resposta DEVE ser um objeto JSON válido, contendo duas chaves:
1. "score": um número inteiro de 1 a 10, onde 1 é "totalmente inadequado" e 10 é "perfeito para a vaga".
2. "justification": um texto curto (2-3 frases) explicando os pontos fortes e fracos do candidato e o porquê da nota.

Seja crítico e objetivo na sua avaliação.`

    const conversationTranscript = conversation
      .map(msg => `${msg.sender === 'bot' ? 'Recrutador' : 'Candidato'}: ${msg.text}`)
      .join('\n')

    const userPrompt = `
# DADOS DA VAGA
- Título: ${job.title}
- Descrição: ${job.description}
- Senioridade: ${job.seniority}
- Habilidades Requeridas: ${job.required_skills.join(", ")}
- Localização: ${job.location}

# DADOS DO CANDIDATO
- Nome: ${candidate.name}
- Senioridade (auto-declarada): ${candidate.seniority}
- Anos de Experiência: ${candidate.yearsOfExperience}
- Cargo Desejado: ${candidate.desiredRole}
- Localização: ${candidate.location}

# TRANSCRIÇÃO DA ENTREVISTA COM O BOT
${conversationTranscript}

# AVALIAÇÃO
Com base em todos os dados acima, gere a pontuação e a justificativa para o candidato em relação à vaga. Lembre-se de retornar APENAS o objeto JSON.
`

    // 3. Chamar a IA
    const { text: aiResponse } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
    })

    // 4. Processar a resposta da IA
    let score, justification
    try {
      const cleanText = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      const parsed = JSON.parse(cleanText)
      
      if (typeof parsed.score !== 'number' || parsed.score < 1 || parsed.score > 10) {
        throw new Error("Score inválido ou fora do intervalo (1-10).")
      }
      if (typeof parsed.justification !== 'string' || parsed.justification.length < 10) {
        throw new Error("Justificativa inválida ou muito curta.")
      }
      
      score = Math.round(parsed.score) // Garante que seja inteiro
      justification = parsed.justification

    } catch (e) {
      console.error("[API-SCORE] Erro ao processar resposta da IA:", e, "Resposta recebida:", aiResponse)
      return NextResponse.json({ error: "Falha ao processar a resposta da IA", details: aiResponse }, { status: 500 })
    }

    // 5. Salvar no banco de dados
    const { error: updateError } = await supabaseAdmin
      .from("candidates")
      .update({ score, score_justification: justification })
      .eq("id", candidateId)

    if (updateError) {
      console.error(`[API-SCORE] Erro ao salvar pontuação para o candidato ${candidateId}:`, updateError)
      return NextResponse.json({ error: "Falha ao salvar a pontuação no banco de dados" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Pontuação gerada e salva com sucesso!",
      score,
      justification,
    })

  } catch (error) {
    console.error("[API-SCORE] Erro inesperado na rota:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
