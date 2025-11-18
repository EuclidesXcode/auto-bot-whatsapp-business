import { generateText } from "ai"
// import { createOpenAI } from "@ai-sdk/openai" // Removido para usar a chamada direta
import { getConversation, updateCandidateData, getCandidate } from "./whatsapp-service"

/* Removido para usar a chamada direta para OpenAI em vez do Gateway Vercel
const openai = createOpenAI({
  baseURL: "https://gateway.vercel.ai/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY,
})
*/


import { supabaseAdmin } from "./supabase/service"

// Obter system prompt configurado
async function getSystemPrompt(): Promise<string> {
  const fallbackPrompt = `Você é um assistente de recrutamento amigável e profissional chamado RecrutaBot.

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
- NUNCA repita perguntas sobre informações que já foram fornecidas
- SEMPRE verifique o contexto antes de fazer uma pergunta

TOM DE VOZ:
- Profissional, mas acolhedor
- Claro e objetivo
- Positivo e encorajador

Lembre-se: você está representando a empresa, então mantenha sempre um tom respeitoso e profissional.`

  try {
    const { data, error } = await supabaseAdmin
      .from("system_prompts")
      .select("content")
      .eq("is_active", true)
      .limit(1)
      .single()

    if (error) {
      console.error("[v0] Erro ao buscar system prompt, usando fallback.", error)
      return fallbackPrompt
    }

    return data?.content || fallbackPrompt
  } catch (error) {
    console.error("[v0] Erro catastrófico ao buscar system prompt, usando fallback.", error)
    return fallbackPrompt
  }
}

async function getCandidateInfoStatus(phone: string): Promise<string> {
  const candidate = await getCandidate(phone)

  if (!candidate) {
    return "Nenhuma informação coletada ainda."
  }

  const collectedInfo: string[] = []
  const missingInfo: string[] = []

  // Verificar cada campo
  if (candidate.name && candidate.name !== "Candidato") {
    collectedInfo.push(`Nome: ${candidate.name}`)
  } else {
    missingInfo.push("Nome completo")
  }

  if (candidate.desiredRole) {
    collectedInfo.push(`Cargo desejado: ${candidate.desiredRole}`)
  } else {
    missingInfo.push("Cargo desejado")
  }

  if (candidate.yearsOfExperience && candidate.yearsOfExperience > 0) {
    collectedInfo.push(`Experiência: ${candidate.yearsOfExperience} anos`)
  } else {
    missingInfo.push("Anos de experiência")
  }

  if (candidate.expectedSalary) {
    collectedInfo.push(`Expectativa salarial: ${candidate.expectedSalary}`)
  } else {
    missingInfo.push("Expectativa salarial")
  }

  if (candidate.location) {
    collectedInfo.push(`Localização: ${candidate.location}`)
  } else {
    missingInfo.push("Localização")
  }

  if (candidate.linkedinUrl) {
    collectedInfo.push(`LinkedIn: ${candidate.linkedinUrl}`)
  } else {
    missingInfo.push("LinkedIn/Portfólio")
  }

  let status = "INFORMAÇÕES JÁ COLETADAS:\n"
  if (collectedInfo.length > 0) {
    status += collectedInfo.join("\n") + "\n\n"
  } else {
    status += "Nenhuma ainda.\n\n"
  }

  status += "INFORMAÇÕES FALTANTES:\n"
  if (missingInfo.length > 0) {
    status += missingInfo.join(", ")
  } else {
    status += "Todas as informações foram coletadas!"
  }

  return status
}

// Processar mensagem com IA e gerar resposta
export async function processMessageWithAI(phone: string, userMessage: string, userName: string): Promise<string> {
  try {
    const conversation = await getConversation(phone)
    const systemPrompt = await getSystemPrompt()

    const conversationHistory = conversation.messages
      .map((msg, index) => {
        const prefix = msg.sender === "candidate" ? "Candidato" : "Assistente"
        return `[Mensagem ${index + 1}] ${prefix}: ${msg.text}`
      })
      .join("\n")

    const infoStatus = await getCandidateInfoStatus(phone)

    const finalPrompt = `${infoStatus}

HISTÓRICO COMPLETO DA CONVERSA:
${conversationHistory}

NOVA MENSAGEM DO CANDIDATO:
${userMessage}

INSTRUÇÕES:
1. Analise o status das informações acima
2. Revise TODO o histórico para entender o contexto
3. NUNCA pergunte sobre informações que já estão coletadas
4. Priorize coletar as informações faltantes
5. Se todas as informações foram coletadas, agradeça e finalize
6. Seja natural e conversacional

Gere sua resposta agora:`

    console.log("--- IA Prompt ---");
    console.log("System Prompt:", systemPrompt);
    console.log("User Prompt:", finalPrompt);
    console.log("-----------------");

    const { text } = await generateText({
      model: "openai/gpt-4o-mini", // Alterado para chamada direta
      system: systemPrompt,
      prompt: finalPrompt,
    })

    console.log("--- IA Response ---");
    console.log(text);
    console.log("-------------------");

    // Apenas extrai a informação, não envia mais a mensagem daqui
    await extractCandidateInfo(phone, conversationHistory + `\n[Nova] Candidato: ${userMessage}`)

    return text
  } catch (error) {
    console.error("[v0] Erro ao processar com IA:", error)

    // Resposta de fallback
    const fallbackMessage = "Desculpe, estou com dificuldades técnicas no momento. Você poderia repetir sua mensagem?"
    
    // Apenas retorna a mensagem de fallback, não envia mais daqui
    return fallbackMessage
  }
}

async function extractCandidateInfo(phone: string, conversationText: string): Promise<void> {
  try {
    const currentCandidate = await getCandidate(phone)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini", // Alterado para chamada direta
      system: `Você é um extrator de informações especializado. Analise a conversa e extraia APENAS as informações que ainda não foram coletadas ou que foram atualizadas.

INFORMAÇÕES ATUAIS DO CANDIDATO:
${JSON.stringify(currentCandidate || {}, null, 2)}

Retorne APENAS um objeto JSON válido com as chaves que você conseguiu extrair da conversa.
Use null para informações não encontradas. Não invente dados.

Formato:
{
  "name": "nome completo (se mencionado)",
  "desiredRole": "cargo desejado exato",
  "yearsOfExperience": número (apenas dígitos),
  "expectedSalary": "faixa salarial mencionada",
  "location": "cidade/estado ou 'Remoto'",
  "linkedinUrl": "URL do LinkedIn se fornecido",
  "email": "email se mencionado"
}`,
      prompt: `Analise esta conversa e extraia informações:

${conversationText}

Retorne o JSON:`,
    })

    // Parse do JSON
    try {
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      const data = JSON.parse(cleanText)

      const validData: any = {}

      if (data.name && data.name !== "Candidato") {
        validData.name = data.name
      }

      if (data.desiredRole) {
        validData.desiredRole = data.desiredRole
      }

      if (data.yearsOfExperience && Number(data.yearsOfExperience) > 0) {
        validData.yearsOfExperience = Number(data.yearsOfExperience)

        // Determinar seniority baseado na experiência
        if (validData.yearsOfExperience < 3) {
          validData.seniority = "Júnior"
        } else if (validData.yearsOfExperience < 6) {
          validData.seniority = "Pleno"
        } else {
          validData.seniority = "Sênior"
        }
      }

      if (data.expectedSalary) {
        validData.expectedSalary = data.expectedSalary
      }

      if (data.location) {
        validData.location = data.location
      }

      if (data.linkedinUrl) {
        validData.linkedinUrl = data.linkedinUrl
      }

      if (data.email) {
        validData.email = data.email
      }

      if (Object.keys(validData).length > 0) {
        updateCandidateData(phone, validData)
        console.log("[v0] ✅ Dados atualizados do candidato:", validData)
      } else {
        console.log("[v0] ℹ️ Nenhum dado novo extraído nesta mensagem")
      }
    } catch (parseError) {
      console.error("[v0] Erro ao fazer parse do JSON:", parseError, "Texto recebido:", text)
    }
  } catch (error) {
    console.error("[v0] Erro ao extrair informações:", error)
  }
}
