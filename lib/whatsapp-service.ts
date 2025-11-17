import type { Candidate, Message } from "./types"
import { supabaseAdmin } from "./supabase/service"

// Enviar mensagem via WhatsApp Business API
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    console.error("[v0] Credenciais do WhatsApp não configuradas")
    return false
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""), // Remove caracteres não numéricos
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Erro ao enviar mensagem via WhatsApp:", error)
      return false
    }

    const data = await response.json()
    console.log("[v0] Mensagem enviada via WhatsApp:", data)

    // Salvar mensagem do bot no banco de dados
    await addMessageToConversation(to, {
      id: data.messages?.[0]?.id || `bot-${Date.now()}`,
      sender: "bot",
      text: message,
      timestamp: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("[v0] Erro catastrófico ao enviar mensagem:", error)
    return false
  }
}

// Adicionar mensagem à conversa no banco de dados
export async function addMessageToConversation(phone: string, message: Message): Promise<void> {
  const { error } = await supabaseAdmin.from("messages").insert({
    id: message.id,
    candidate_phone: phone,
    sender: message.sender,
    text: message.text,
    timestamp: message.timestamp,
  })

  if (error) {
    console.error("[v0] Erro ao salvar mensagem no DB:", error)
  }
}

// Obter todas as conversas do banco de dados
export async function getConversations() {
  const { data: candidates, error } = await supabaseAdmin
    .from("candidates")
    .select("id, name, phone, messages (id, sender, text, timestamp)")
    .order("last_message_at", { ascending: false })

  if (error) {
    console.error("[v0] Erro ao buscar conversas do DB:", error)
    return []
  }

  return candidates.map(c => ({
    id: c.id,
    candidateId: c.id,
    candidateName: c.name,
    candidatePhone: c.phone,
    messages: c.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
  }))
}

// Obter uma conversa específica do banco de dados
export async function getConversation(phone: string) {
  const { data: candidate, error } = await supabaseAdmin
    .from("candidates")
    .select("id, name, phone, messages (id, sender, text, timestamp)")
    .eq("phone", phone)
    .single()

  if (error || !candidate) {
    console.error("[v0] Erro ao buscar conversa específica do DB:", error)
    // Retorna uma estrutura vazia para não quebrar o serviço de IA
    return {
      id: phone,
      candidateId: phone,
      candidateName: "Candidato",
      candidatePhone: phone,
      messages: [],
    }
  }

  return {
    id: candidate.id,
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidatePhone: candidate.phone,
    messages: candidate.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
  }
}

// Atualizar ou criar um candidato no banco de dados
export async function updateOrCreateCandidate(
  phone: string,
  name: string,
  text: string
): Promise<void> {
  const upsertData: Partial<Candidate> & { phone: string } = {
    phone: phone,
    last_message_at: new Date().toISOString(),
    last_message_preview: text,
  }

  if (name) {
    upsertData.name = name
  }

  const { error } = await supabaseAdmin
    .from("candidates")
    .upsert(upsertData, { onConflict: "phone" })

  if (error) {
    console.error("[v0] Erro ao fazer upsert do candidato:", error)
  }
}

// Obter todos os candidatos do banco de dados
export async function getCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabaseAdmin.from("candidates").select("*")
  if (error) {
    console.error("[v0] Erro ao buscar candidatos:", error)
    return []
  }
  return data as Candidate[]
}

// Obter um candidato específico do banco de dados
export async function getCandidate(phone: string): Promise<Candidate | undefined> {
  const { data, error } = await supabaseAdmin.from("candidates").select("*").eq("phone", phone).single()
  if (error) {
    console.error("[v0] Erro ao buscar candidato específico:", error)
    return undefined
  }
  return data as Candidate
}

// Atualizar dados de um candidato no banco de dados
export async function updateCandidateData(phone: string, data: Partial<Candidate>): Promise<void> {
  const { error } = await supabaseAdmin.from("candidates").update(data).eq("phone", phone)
  if (error) {
    console.error("[v0] Erro ao atualizar dados do candidato:", error)
  }
}

// Deletar um candidato e suas mensagens do banco de dados
export async function deleteCandidate(phone: string): Promise<boolean> {
  // O 'ON DELETE CASCADE' na tabela 'messages' cuidará de remover as mensagens.
  const { error } = await supabaseAdmin.from("candidates").delete().eq("phone", phone)

  if (error) {
    console.error("[v0] Erro ao deletar candidato:", error)
    return false
  }

  console.log("[v0] Candidato e suas conversas removidos do DB:", phone)
  return true
}