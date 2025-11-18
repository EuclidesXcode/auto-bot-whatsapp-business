import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { CandidateList } from "@/components/candidate-list"
import { CandidateDetails } from "@/components/candidate-details"
import { ConversationView } from "@/components/conversation-view"
import { JobsManagement } from "@/components/jobs-management"
import { SystemPromptConfig } from "@/components/system-prompt-config"
import { WebhookSetupGuide } from "@/components/webhook-setup-guide"
import { UserManagement } from "@/components/user-management"
import { Sidebar } from "@/components/sidebar"
import { mockJobs, mockSystemPrompt } from "@/lib/mock-data"
import type { Candidate, Job, Conversation, SystemPrompt, Message } from "@/lib/types"

interface DashboardClientProps {
  user: {
    id: string
    email: string
    name: string
    role: "admin" | "recruiter"
  }
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [activeView, setActiveView] = useState<
    "candidates" | "conversations" | "jobs" | "system-prompt" | "webhook-setup" | "users"
  >("candidates")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [jobs] = useState<Job[]>(mockJobs)
  const [systemPrompt] = useState<SystemPrompt>(mockSystemPrompt)
  const [loading, setLoading] = useState(true)

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => {
      const unreadInConv = conv.messages.filter(
        (m) => m.sender === "candidate" && !m.is_read
      ).length
      return total + unreadInConv
    }, 0)
  }, [conversations])

  const fetchData = async () => {
    try {
      const [candidatesRes, conversationsRes] = await Promise.all([
        fetch("/api/candidates"),
        fetch("/api/conversations"),
      ])

      if (!candidatesRes.ok || !conversationsRes.ok) {
        throw new Error("Falha ao buscar dados")
      }

      const candidatesData = await candidatesRes.json()
      const conversationsData = await conversationsRes.json()

      setCandidates(candidatesData)
      setConversations(conversationsData)
    } catch (error) {
      console.error("[v0] Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 1. Busca os dados iniciais
    fetchData()

    // 2. Configura as inscrições em tempo real do Supabase
    const supabase = createClient()

    const candidatesChannel = supabase
      .channel("realtime-candidates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "candidates" },
        (payload) => {
          console.log("[Realtime] Atualização de candidato:", payload.new)
          const updatedCandidate = payload.new as Candidate
          setCandidates((current) =>
            current.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
          )
          setSelectedCandidate((current) =>
            current?.id === updatedCandidate.id ? updatedCandidate : current
          )
        }
      )
      .subscribe()

    const messagesChannel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          console.log("[Realtime] Nova mensagem recebida:", payload.new)
          // A forma mais simples de garantir consistência é re-buscar os dados
          fetchData()
        }
      )
      .subscribe()

    // 3. Limpa as inscrições quando o componente é desmontado
    return () => {
      supabase.removeChannel(candidatesChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [])

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)

    const hasUnread = conversation.messages.some((m) => m.sender === "candidate" && !m.is_read)

    if (hasUnread) {
      console.log(`[UI] Marcando mensagens como lidas para ${conversation.candidatePhone}`)
      // Otimisticamente atualiza a UI
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === conversation.id) {
          return {
            ...conv,
            messages: conv.messages.map((m) => ({ ...m, is_read: true })),
          }
        }
        return conv
      })
      setConversations(updatedConversations)

      // Chama a API para marcar como lido no backend
      await fetch(`/api/conversations/${conversation.candidatePhone}/mark-as-read`, {
        method: "POST",
      })
    }
  }

  const handleCandidateDeleted = async () => {
    await fetchData()
    setSelectedCandidate(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        userRole={user.role}
        userName={user.name}
        unreadCount={totalUnreadCount}
      />

      <main className="flex-1 overflow-hidden">
        {activeView === "candidates" && (
          <div className="flex h-full">
            <div className={`${selectedCandidate ? "w-1/2" : "w-full"} border-r border-border`}>
              <CandidateList
                candidates={candidates}
                selectedCandidate={selectedCandidate}
                onSelectCandidate={setSelectedCandidate}
                jobs={jobs}
              />
            </div>
            {selectedCandidate && (
              <div className="w-1/2">
                <CandidateDetails
                  candidate={selectedCandidate}
                  jobs={jobs}
                  onClose={() => setSelectedCandidate(null)}
                  onDelete={handleCandidateDeleted}
                />
              </div>
            )}
          </div>
        )}

        {activeView === "conversations" && (
          <ConversationView
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
          />
        )}

        {activeView === "jobs" && <JobsManagement jobs={jobs} userRole={user.role} />}

        {activeView === "system-prompt" && <SystemPromptConfig systemPrompt={systemPrompt} userRole={user.role} />}

        {activeView === "webhook-setup" && (
          <div className="h-full overflow-y-auto p-6">
            <WebhookSetupGuide />
          </div>
        )}

        {activeView === "users" && user.role === "admin" && (
          <div className="h-full overflow-y-auto p-6">
            <UserManagement />
          </div>
        )}
      </main>
    </div>
  )
}
