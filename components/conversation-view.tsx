"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"
import type { Conversation } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"

interface ConversationViewProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onSendMessage: (message: string) => void
}

export function ConversationView({
  conversations,
  selectedConversation,
  onSelectConversation,
  onSendMessage,
}: ConversationViewProps) {
  const [messageText, setMessageText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedConversation?.messages])

  const handleLocalSendMessage = () => {
    if (!messageText.trim()) return
    onSendMessage(messageText)
    setMessageText("")
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
            const hasUnread = conversation.messages.some((m) => m.sender === "candidate" && !m.is_read)

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 border-b border-border text-left hover:bg-accent transition-colors ${
                  isSelected ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{conversation.candidateName[0]}</AvatarFallback>
                    </Avatar>
                    {hasUnread && (
                      <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </div>
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
                  className={`flex gap-3 ${
                    message.sender === "recruiter" || message.sender === "bot" ? "justify-end" : ""
                  }`}
                >
                  <div
                    className={`flex gap-3 items-end ${
                      message.sender === "recruiter" || message.sender === "bot" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.sender === "candidate" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 max-w-xs lg:max-w-md ${
                        message.sender === "candidate"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none text-foreground">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    </div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleLocalSendMessage()}
                />
                <Button onClick={handleLocalSendMessage}>
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
