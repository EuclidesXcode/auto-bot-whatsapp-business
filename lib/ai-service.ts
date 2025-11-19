import { generateText } from "ai"
import type { Candidate } from "./types"
import { getConversation, updateCandidateData, getCandidate } from "./whatsapp-service"
import { supabaseAdmin } from "./supabase/service"

// Busca e formata um resumo das vagas abertas
async function getOpenJobsSummary(): Promise<string> {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from("jobs")
      .select("title, seniority, location")
      .eq("status", "open")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Erro ao buscar vagas abertas:", error)
      return "" // Retorna vazio em caso de erro para não quebrar o bot
    }

    if (!jobs || jobs.length === 0) {
      return "No momento, não temos vagas abertas, mas estamos sempre em busca de novos talentos. Vamos continuar com seu cadastro."
    }

    const jobSummaries = jobs.map(
      (job) => `- ${job.title} (Senioridade: ${job.seniority}, Local: ${job.location})`
    )

    return `VAGAS ABERTAS ATUALMENTE:\n${jobSummaries.join("\n")}`
  } catch (error) {
    console.error("[v0] Erro catastrófico ao buscar vagas:", error)
    return ""
  }
}



// Obter system prompt configurado
async function getSystemPrompt(): Promise<string> {
  const fallbackPrompt = `Você é um assistente de recrutamento amigável e profissional chamado RecrutaBot.

DIRETRIZES DE CONVERSAÇÃO:
- INÍCIO DA CONVERSA: Apresente-se e pergunte ao candidato se ele prefere responder a algumas perguntas ou enviar um currículo (PDF, XLSX, CSV) para agilizar o processo.
- Se o candidato escolher enviar o currículo, responda: "Ótimo! Por favor, anexe e envie seu currículo aqui no chat. Vou analisar as informações para você." e aguarde o arquivo.
- Se o candidato escolher responder às perguntas, inicie a coleta de dados normalmente, começando pelo nome completo.

Sua missão é conduzir uma conversa natural com os candidatos para coletar as seguintes informações obrigatórias (caso ele não envie o currículo):
1. Nome completo
2. Cargo desejado
3. Anos de experiência na área
4. Expectativa salarial (faixa de valores)
5. Localização (cidade/estado ou preferência por trabalho remoto)
6. Link do LinkedIn ou portfólio online

- Seja cordial, mas profissional.
- Faça uma pergunta por vez para não sobrecarregar o candidato.
- Use linguagem clara e direta em português brasileiro.
- Se o candidato fornecer informações incompletas, peça gentilmente mais detalhes.
- Confirme as informações importantes antes de prosseguir.
- Ao final da coleta, agradeça e informe que um recrutador entrará em contato em breve.
- NUNCA repita perguntas sobre informações que já foram fornecidas.
- SEMPRE verifique o contexto antes de fazer uma pergunta.

GERENCIAMENTO DE FLUXO:
- Seu objetivo principal e inegociável é coletar as informações listadas. Todas as suas respostas devem, direta ou indiretamente, levar a esse objetivo.
- Se o candidato perguntar sobre vagas disponíveis, use a lista de 'VAGAS ABERTAS' fornecida no contexto para responder. Se a lista estiver vazia, informe que não há vagas no momento. Após responder, continue o fluxo de coleta de dados.
- Se o candidato fizer perguntas sobre a empresa ou a vaga, responda de forma breve e educada, e imediatamente retorne à próxima pergunta da sua lista. Exemplo: "Ótima pergunta! Os detalhes específicos da vaga serão discutidos com o recrutador. Para continuarmos, qual seu nome completo?"
- Se o candidato desviar completamente do assunto (ex: falar sobre o tempo, futebol), redirecione-o firmemente de volta ao processo. Exemplo: "Entendo, mas para mantermos o foco na sua candidatura, preciso que me informe seus anos de experiência." ou "Agradeço o comentário. Vamos focar em você. Para qual cargo você gostaria de se candidatar?". Use variações para não soar repetitivo.
- Evite se aprofundar em conversas informais ou que não contribuam para a coleta de dados. Sua prioridade é a eficiência.

TOM DE VOZ:
- Profissional, mas acolhedor.
- Claro e objetivo.
- Positivo e encorajador.

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

// Verifica se todos os detalhes obrigatórios do candidato foram coletados
function areAllDetailsCollected(candidate: Candidate): boolean {
  return (
    !!candidate.name &&
    candidate.name !== "Candidato" &&
    !!candidate.desiredRole &&
    !!candidate.yearsOfExperience &&
    candidate.yearsOfExperience > 0 &&
    !!candidate.expectedSalary &&
    !!candidate.location &&
    !!candidate.linkedinUrl
  )
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
    const [conversation, systemPrompt, openJobsSummary] = await Promise.all([
      getConversation(phone),
      getSystemPrompt(),
      getOpenJobsSummary(),
    ])

    const conversationHistory = conversation.messages
      .map((msg, index) => {
        const prefix = msg.sender === "candidate" ? "Candidato" : "Assistente"
        return `[Mensagem ${index + 1}] ${prefix}: ${msg.text}`
      })
      .join("\n")

    const infoStatus = await getCandidateInfoStatus(phone)

    const finalPrompt = `${openJobsSummary}

${infoStatus}

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

    console.log("--- IA Prompt ---")
    console.log("System Prompt:", systemPrompt)
    console.log("User Prompt:", finalPrompt)
    console.log("-----------------")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini", // Alterado para chamada direta
      system: systemPrompt,
      prompt: finalPrompt,
    })

    console.log("--- IA Response ---")
    console.log(text)
    console.log("-------------------")

    // Extrai a informação e verifica se a coleta terminou
    await extractCandidateInfo(phone, conversationHistory + `\n[Nova] Candidato: ${userMessage}`)

    // Pega os dados mais recentes do candidato após a extração
    const updatedCandidate = await getCandidate(phone)
    if (updatedCandidate && areAllDetailsCollected(updatedCandidate)) {
      console.log(`[v0] Coleta de dados completa. Desativando bot para o candidato: ${phone}`)
      await updateCandidateData(phone, { bot_status: "inactive" })
    }

    return text
  } catch (error) {
    console.error("[v0] Erro ao processar com IA:", error)

    // Resposta de fallback
    const fallbackMessage = "Desculpe, estou com dificuldades técnicas no momento. Você poderia repetir sua mensagem?"
    return fallbackMessage
  }
}

async function extractCandidateInfo(phone: string, conversationText: string): Promise<void> {
  try {
    const currentCandidate = await getCandidate(phone)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `Você é um extrator de informações especializado. Analise a conversa e extraia APENAS as informações que ainda não foram coletadas ou que foram atualizadas.

INFORMAÇÕES ATUAIS DO CANDIDATO:
${JSON.stringify(currentCandidate || {}, null, 2)}`,
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
        await updateCandidateData(phone, validData)
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

// Extrai informações estruturadas de um texto de currículo
export async function extractInfoFromResume(resumeText: string): Promise<Partial<Candidate> | null> {
  try {
    const systemPrompt = `Você é um especialista em RH e um robô de extração de dados altamente preciso. Sua tarefa é analisar o texto de um currículo e extrair as informações do candidato em um formato JSON.

REGRAS DE EXTRAÇÃO:
- Extraia apenas as informações presentes no texto. Não invente dados.
- Se uma informação não for encontrada, omita a chave do JSON.
- 'name': Nome completo do candidato.
- 'email': O endereço de e-mail principal.
- 'phone': O número de telefone.
- 'location': Cidade e estado. Ex: "São Paulo, SP".
- 'linkedinUrl': O link completo para o perfil do LinkedIn.
- 'yearsOfExperience': Um NÚMERO representando o total de anos de experiência relevante. Se o texto disser "5 anos e 6 meses", retorne 5.5.
- 'skills': Uma ARRAY de strings com as principais habilidades técnicas e ferramentas. Ex: ["React", "Node.js", "TypeScript", "AWS"].
- 'education': Um resumo em uma frase da formação principal. Ex: "Bacharel em Ciência da Computação pela USP".

Retorne APENAS o objeto JSON, sem nenhum texto ou explicação adicional.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: `Analise o seguinte texto de currículo e extraia os dados conforme as regras:\n\n--- INÍCIO DO CURRÍCULO ---\n${resumeText}\n--- FIM DO CURRÍCULO ---`,
    })

    console.log("[AI-Resume] Resposta da IA para extração:", text)

    // Limpa e faz o parse da resposta JSON
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const data = JSON.parse(cleanText)

    // Validação e formatação final dos dados
    const validData: Partial<Candidate> = {}
    if (data.name && typeof data.name === "string") validData.name = data.name
    if (data.email && typeof data.email === "string") validData.email = data.email
    if (data.phone && typeof data.phone === "string") validData.phone = data.phone
    if (data.location && typeof data.location === "string") validData.location = data.location
    if (data.linkedinUrl && typeof data.linkedinUrl === "string") validData.linkedinUrl = data.linkedinUrl
    if (data.yearsOfExperience && typeof data.yearsOfExperience === "number") {
      validData.yearsOfExperience = data.yearsOfExperience
      // Sugere senioridade com base na experiência
      if (data.yearsOfExperience < 3) validData.seniority = "Júnior"
      else if (data.yearsOfExperience < 6) validData.seniority = "Pleno"
      else validData.seniority = "Sênior"
    }
    // Adicione aqui a extração de 'skills' e 'education' se os campos existirem no seu tipo Candidate

    return validData
  } catch (error) {
    console.error("[AI-Resume] Erro ao extrair informações do currículo:", error)
    return null
  }
}
