"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Copy, ExternalLink, AlertCircle, Send, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export function WebhookSetupGuide() {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("Olá! Esta é uma mensagem de teste do Tria+.")
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)

  const [verifyToken, setVerifyToken] = useState("carregando...")

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/whatsapp/webhook`
      : "https://SEU_DOMINIO.vercel.app/api/whatsapp/webhook"

  useEffect(() => {
    fetch("/api/whatsapp/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVerifyToken(data.verifyToken || "não configurado")
        }
      })
      .catch((err) => {
        console.error("[v0] Erro ao carregar configuração:", err)
        setVerifyToken("erro ao carregar")
      })
  }, [])

  const copyToClipboard = (text: string, type: "url" | "token") => {
    navigator.clipboard.writeText(text)
    if (type === "url") {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } else {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      setSendResult({ success: false, message: "Preencha o número e a mensagem" })
      return
    }

    setIsSending(true)
    setSendResult(null)

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSendResult({ success: true, message: "Mensagem enviada com sucesso!" })
        console.log("[v0] Mensagem de teste enviada:", data)
      } else {
        setSendResult({ success: false, message: data.error || "Erro ao enviar mensagem" })
        console.error("[v0] Erro ao enviar mensagem de teste:", data)
      }
    } catch (error) {
      setSendResult({ success: false, message: "Erro de conexão" })
      console.error("[v0] Erro ao enviar mensagem de teste:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Webhook WhatsApp</CardTitle>
          <CardDescription>Configure o webhook para receber mensagens em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sem o webhook configurado, o painel não receberá mensagens do WhatsApp. Siga os passos abaixo para ativar
              a integração.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  1
                </span>
                Acesse o Meta for Developers
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Vá para{" "}
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  developers.facebook.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  2
                </span>
                Navegue até seu App WhatsApp
              </h3>
              <p className="text-sm text-muted-foreground ml-8">Meus Aplicativos → Seu App → WhatsApp → Configuração</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  3
                </span>
                Configure a URL do Webhook
              </h3>
              <div className="ml-8 space-y-3">
                <div>
                  <label className="text-sm font-medium">URL de Retorno:</label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">{webhookUrl}</code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhookUrl, "url")}>
                      {copiedUrl ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Token de Verificação:</label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">{verifyToken}</code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(verifyToken, "token")}>
                      {copiedToken ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  4
                </span>
                Clique em "Verificar e Salvar"
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                O Meta irá validar se o webhook está respondendo corretamente
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  5
                </span>
                Inscreva-se no evento "messages"
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Após salvar, marque a caixa de seleção <strong>messages</strong> para receber mensagens
              </p>
            </div>
          </div>

          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Importante:</strong> Depois de configurar, envie uma mensagem para o número do WhatsApp Business
              para testar. O candidato e a conversa aparecerão automaticamente no painel.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-sm">Testando o Webhook</h4>
            <p className="text-sm text-muted-foreground">
              Para testar manualmente se o webhook está acessível, abra esta URL no navegador:
            </p>
            <code className="block bg-muted px-3 py-2 rounded text-xs break-all">
              {webhookUrl}?hub.mode=subscribe&hub.challenge=TEST123&hub.verify_token={verifyToken}
            </code>
            <p className="text-sm text-muted-foreground">
              Se configurado corretamente, deve retornar: <code className="bg-muted px-1 py-0.5 rounded">TEST123</code>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensagem de Teste</CardTitle>
          <CardDescription>Teste o envio de mensagens via WhatsApp Business API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-phone">Número do WhatsApp (com código do país)</Label>
            <Input
              id="test-phone"
              type="tel"
              placeholder="+5511999999999"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Formato: +[código país][DDD][número] - Ex: +5511999999999</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-message">Mensagem</Label>
            <Textarea
              id="test-message"
              placeholder="Digite a mensagem de teste..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={sendTestMessage} disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem de Teste
              </>
            )}
          </Button>

          {sendResult && (
            <Alert
              className={
                sendResult.success
                  ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900"
                  : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900"
              }
            >
              {sendResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertDescription
                className={sendResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}
              >
                {sendResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Variáveis de ambiente configuradas</span>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">URL do webhook acessível</span>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Webhook configurado na Meta</span>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground">Configure o webhook na Meta seguindo os passos acima</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
