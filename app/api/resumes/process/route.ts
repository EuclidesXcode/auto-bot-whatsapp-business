import { NextResponse } from "next/server"
import { extractInfoFromResume } from "@/lib/ai-service"
import { updateCandidateData, sendWhatsAppMessage } from "@/lib/whatsapp-service"
import pdf from "pdf-parse"
import * as xlsx from "xlsx"

// Função para buscar a URL do arquivo e fazer o download
async function downloadMedia(mediaId: string): Promise<Buffer> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error("Token de acesso do WhatsApp não configurado.")
  }

  // 1. Obter a URL da mídia
  const urlResponse = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!urlResponse.ok) {
    const error = await urlResponse.json()
    console.error("[ResumeProcess] Erro ao obter URL da mídia:", error)
    throw new Error("Não foi possível obter a URL da mídia do WhatsApp.")
  }

  const { url } = await urlResponse.json()

  // 2. Fazer o download do arquivo
  const fileResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!fileResponse.ok) {
    const error = await fileResponse.text()
    console.error("[ResumeProcess] Erro ao baixar o arquivo:", error)
    throw new Error("Não foi possível baixar o arquivo do currículo.")
  }

  const arrayBuffer = await fileResponse.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Função para extrair texto de diferentes tipos de arquivo
async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case "application/pdf":
      const data = await pdf(buffer)
      return data.text

    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": // XLSX
    case "text/csv":
      const workbook = xlsx.read(buffer, { type: "buffer" })
      let fullText = ""
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName]
        const sheetData = xlsx.utils.sheet_to_csv(worksheet)
        fullText += sheetData + "\n"
      })
      return fullText

    default:
      throw new Error(`Tipo de arquivo não suportado: ${mimeType}`)
  }
}

export async function POST(request: Request) {
  try {
    const { mediaId, mimeType, candidatePhone } = await request.json()

    if (!mediaId || !mimeType || !candidatePhone) {
      return NextResponse.json({ error: "Dados insuficientes para processar o currículo" }, { status: 400 })
    }

    // 1. Baixar o arquivo
    const fileBuffer = await downloadMedia(mediaId)

    // 2. Extrair o texto
    const resumeText = await extractTextFromFile(fileBuffer, mimeType)
    if (!resumeText.trim()) {
      throw new Error("O texto do currículo está vazio ou não pôde ser extraído.")
    }

    // 3. Usar a IA para extrair os dados
    const extractedData = await extractInfoFromResume(resumeText)
    if (!extractedData || Object.keys(extractedData).length === 0) {
      await sendWhatsAppMessage(
        candidatePhone,
        "Analisei seu currículo, mas não consegui extrair as informações principais. Vamos tentar com as perguntas. Para começar, qual seu nome completo?"
      )
      throw new Error("IA não conseguiu extrair dados do currículo.")
    }

    // 4. Atualizar o banco de dados
    await updateCandidateData(candidatePhone, extractedData)

    // 5. Notificar o usuário com os dados extraídos
    const summary = Object.entries(extractedData)
      .map(([key, value]) => {
        // Formata a chave para ser mais legível
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        return `- ${formattedKey}: ${Array.isArray(value) ? value.join(', ') : value}`;
      })
      .join("\n")

    const confirmationMessage = `Consegui extrair os seguintes dados do seu currículo:\n\n${summary}\n\nEstá tudo correto? Se algo estiver faltando ou incorreto, por favor, me informe.`
    await sendWhatsAppMessage(candidatePhone, confirmationMessage)

    return NextResponse.json({ success: true, message: "Currículo processado com sucesso." })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[ResumeProcess] Erro no processamento do currículo:", errorMessage)
    
    // Tenta notificar o usuário sobre o erro, se possível
    try {
      const { candidatePhone } = await request.json()
      if (candidatePhone) {
        await sendWhatsAppMessage(candidatePhone, "Tive um problema ao processar seu currículo. Poderia tentar enviar novamente? Se o erro persistir, podemos continuar com as perguntas.")
      }
    } catch (notifyError) {
      console.error("[ResumeProcess] Falha ao notificar usuário sobre o erro:", notifyError)
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
