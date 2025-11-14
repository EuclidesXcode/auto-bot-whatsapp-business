"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, Lock, Loader2 } from "lucide-react"
import type { SystemPrompt } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface SystemPromptConfigProps {
  systemPrompt: SystemPrompt
  userRole: "admin" | "recruiter"
}

export function SystemPromptConfig({ systemPrompt, userRole }: SystemPromptConfigProps) {
  const [prompt, setPrompt] = useState(systemPrompt.content)
  const [saving, setSaving] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testMessage, setTestMessage] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [testing, setTesting] = useState(false)
  const isAdmin = userRole === "admin"
  const { toast } = useToast()

  const handleSave = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "O prompt não pode estar vazio",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    console.log("[v0] Salvando system prompt...")

    try {
      const response = await fetch("/api/system-prompt", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: prompt,
          updatedBy: "admin@recrutaai.com",
        }),
      })

      console.log("[v0] Resposta da API:", response.status)
      const data = await response.json()
      console.log("[v0] Dados retornados:", data)

      if (response.ok) {
        toast({
          title: "Salvo com sucesso",
          description: "As configurações do chatbot foram atualizadas",
        })
      } else {
        throw new Error(data.error || "Falha ao salvar")
      }
    } catch (error) {
      console.error("[v0] Erro ao salvar system prompt:", error)
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestBot = async () => {
    if (!testMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem para testar",
        variant: "destructive",
      })
      return
    }

    setTesting(true)
    setTestResponse("")
    console.log("[v0] Testando bot com mensagem:", testMessage)

    try {
      const response = await fetch("/api/test-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testMessage,
          systemPrompt: prompt,
        }),
      })

      const data = await response.json()
      console.log("[v0] Resposta do teste:", data)

      if (response.ok) {
        setTestResponse(data.response)
      } else {
        throw new Error(data.error || "Falha ao testar")
      }
    } catch (error) {
      console.error("[v0] Erro ao testar bot:", error)
      toast({
        title: "Erro ao testar",
        description: error instanceof Error ? error.message : "Não foi possível testar o bot. Tente novamente.",
        variant: "destructive",
      })
      setTestResponse("Erro ao processar resposta. Verifique suas credenciais da OpenAI.")
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <div className="h-full overflow-y-auto bg-background">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Configuração do Chatbot</h2>
              <p className="text-sm text-muted-foreground mt-1">System Prompt que define o comportamento do bot</p>
            </div>
            {!isAdmin && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                Somente Leitura
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instruções do Sistema</CardTitle>
              <CardDescription>
                Define o tom de voz, regras de coleta de informações e forma de responder aos candidatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={16}
                disabled={!isAdmin}
                className="font-mono text-sm"
                placeholder="Digite as instruções para o chatbot..."
              />

              {isAdmin && (
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setTestDialogOpen(true)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Testar Bot
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Coletadas</CardTitle>
              <CardDescription>Dados obrigatórios que o chatbot deve coletar de cada candidato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Nome completo",
                  "Cargo desejado",
                  "Anos de experiência",
                  "Salário esperado",
                  "Cidade ou remoto",
                  "Link de LinkedIn ou portfólio",
                ].map((field, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-foreground">{field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Última Atualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Atualizado por: {systemPrompt.updatedBy}</p>
                <p className="mt-1">
                  Data:{" "}
                  {new Date(systemPrompt.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Testar Chatbot</DialogTitle>
            <DialogDescription>
              Envie uma mensagem de teste para ver como o bot responderá com o prompt atual
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Mensagem do Candidato</label>
              <Input
                placeholder="Ex: Olá, quero me candidatar"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleTestBot()
                  }
                }}
              />
            </div>

            {testResponse && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Resposta do Bot</label>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{testResponse}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                Fechar
              </Button>
              <Button onClick={handleTestBot} disabled={testing}>
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  "Enviar Teste"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
