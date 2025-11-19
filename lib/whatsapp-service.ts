import type { Candidate, Message } from "./types"
import { supabaseAdmin } from "./supabase/service"

// Enviar mensagem via WhatsApp Business API
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  sender: "bot" | "recruiter" = "bot"
): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    console.error("[v0] Credenciais do WhatsApp não configuradas")
    return false
  }

  // Se o remetente for um recrutador, desativa o bot para este candidato.
  if (sender === "recruiter") {
    const candidate = await getCandidate(to) // 'to' é o número de telefone
    if (candidate && candidate.bot_status !== "inactive") {
      console.log(`[WhatsApp Service] Mensagem do recrutador. Desativando bot para ${to}.`)
      await updateCandidateData(to, { bot_status: "inactive" })
    }
  }

  const cleanedTo = to.replace(/\D/g, "");
  
  // Normaliza o número de celular brasileiro adicionando o 9º dígito se necessário
  let normalizedTo = cleanedTo;
  if (cleanedTo.startsWith("55") && cleanedTo.length === 12) {
    normalizedTo = cleanedTo.substring(0, 4) + "9" + cleanedTo.substring(4);
    console.log(`[v0] Número brasileiro normalizado: de ${cleanedTo} para ${normalizedTo}`);
  }

  console.log(`[v0] Tentando enviar mensagem para: ${to} (Formatado como: ${normalizedTo})`);

  try {
    const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedTo, // Usar o número normalizado
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

    // Salvar mensagem enviada no banco de dados
    await addMessageToConversation(to, {
      id: data.messages?.[0]?.id || `${sender}-${Date.now()}`,
      sender: sender, // Usar o parâmetro 'sender'
      text: message,
      timestamp: new Date().toISOString(),
      is_read: true, // Mensagens enviadas pelo sistema são sempre 'lidas'
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
    is_read: message.is_read ?? false, // Default para false se não for fornecido
  })

  if (error) {
    console.error("[v0] Erro ao salvar mensagem no DB:", error)
  }
}

// Obter todas as conversas do banco de dados
export async function getConversations() {
  // Passo 1: Buscar todos os candidatos
  const { data: candidates, error: candidatesError } = await supabaseAdmin
    .from("candidates")
    .select("id, name, phone")
    .order("last_message_at", { ascending: false });

  if (candidatesError) {
    console.error("[v0] Erro ao buscar candidatos do DB:", candidatesError);
    return [];
  }

  // Passo 2: Buscar todas as mensagens
  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("id, candidate_phone, sender, text, timestamp, is_read");

  if (messagesError) {
    console.error("[v0] Erro ao buscar mensagens do DB:", messagesError);
    // Retorna os candidatos mesmo que as mensagens falhem, para não quebrar a UI
    return candidates.map(c => ({
      id: c.id,
      candidateId: c.id,
      candidateName: c.name,
      candidatePhone: c.phone,
      messages: [],
    }));
  }

  // Passo 3: Mapear mensagens para cada candidato
  const messagesByCandidate = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    if (!acc[msg.candidate_phone]) {
      acc[msg.candidate_phone] = [];
    }
    acc[msg.candidate_phone].push(msg);
    return acc;
  }, {});

  // Passo 4: Combinar os dados e retornar as conversas completas
  return candidates.map(c => ({
    id: c.id,
    candidateId: c.id,
    candidateName: c.name,
    candidatePhone: c.phone,
    messages: (messagesByCandidate[c.phone] || []).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
  }));
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
export async function updateOrCreateCandidate(phone: string, name: string): Promise<void> {
  const { error } = await supabaseAdmin.from("candidates").upsert(
    {
      id: phone,
      phone: phone,
      name: name,
      last_message_at: new Date().toISOString(),
    },
    { onConflict: "phone" }
  )

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