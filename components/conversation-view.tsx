import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"
import type { Conversation } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"

interface ConversationViewProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
}

export function ConversationView({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationViewProps) {
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedConversation?.messages])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedConversation.candidatePhone,
          message: messageText,
        }),
      })

      if (response.ok) {
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso",
        })
        setMessageText("")
      } else {
        throw new Error("Falha ao enviar mensagem")
      }
    } catch (error) {
      console.error("[v0] Erro ao enviar mensagem:", error)
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-full flex bg-background">
      {/* Lista de conversas */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Conversas</h2>
          <p className="text-sm text-muted-foreground mt-1">{conversations.length} conversas ativas</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1]
            const isSelected = selectedConversation?.id === conversation.id

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 border-b border-border text-left hover:bg-accent transition-colors ${
                  isSelected ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{conversation.candidateName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">{conversation.candidateName}</h3>
                      <span className="text-xs text-muted-foreground ">
                        {lastMessage?.timestamp &&
                          new Date(lastMessage.timestamp).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage?.text ?? "Nenhuma mensagem ainda"}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{selectedConversation.candidateName}</h2>
              <p className="text-sm text-muted-foreground">{selectedConversation.candidatePhone}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "recruiter" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col gap-1 max-w-[70%] ${message.sender === "recruiter" ? "items-end" : ""}`}
                  >
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "candidate"
                          ? "bg-muted"
                          : message.sender === "bot"
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none text-foreground">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSendMessage()}
                  disabled={sending}
                />
                <Button onClick={handleSendMessage} disabled={sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Selecione uma conversa</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Escolha uma conversa à esquerda para visualizar as mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
