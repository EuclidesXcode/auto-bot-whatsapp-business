"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Trash2 } from "lucide-react"
import type { Conversation } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ConversationViewProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onSendMessage: (message: string) => void
  onDeleteConversation: (conversationId: string) => void
}

export function ConversationView({
  conversations,
  selectedConversation,
  onSelectConversation,
  onSendMessage,
  onDeleteConversation,
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

  const handleDelete = () => {
    if (selectedConversation) {
      onDeleteConversation(selectedConversation.candidatePhone)
    }
  }

  return (
    <TooltipProvider>
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

              let lastMessagePreview = lastMessage?.text ?? "Nenhuma mensagem ainda"
              if (lastMessage) {
                if (lastMessage.sender === "recruiter") {
                  lastMessagePreview = `Você: ${lastMessage.text}`
                } else if (lastMessage.sender === "bot") {
                  lastMessagePreview = `Bot: ${lastMessage.text}`
                }
              }

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
                      <p className="text-sm text-muted-foreground truncate">{lastMessagePreview}</p>
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
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedConversation.candidateName}</h2>
                  <p className="text-sm text-muted-foreground">{selectedConversation.candidatePhone}</p>
                </div>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir conversa</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso excluirá permanentemente a conversa e todos os dados
                        do candidato.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedConversation.messages.map((message) => {
                  const isFromSystem = message.sender === "bot" || message.sender === "recruiter"
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-3 ${isFromSystem ? "justify-end" : ""}`}
                    >
                      {!isFromSystem && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg p-3 max-w-xs lg:max-w-md ${
                          message.sender === "candidate"
                            ? "bg-muted"
                            : message.sender === "bot"
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-primary text-primary-foreground" // Recruiter
                        }`}
                      >
                        <div className="prose prose-sm max-w-none text-inherit">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                      </div>
                      {isFromSystem && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.sender === "bot" ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )
                })}
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
    </TooltipProvider>
  )
}
