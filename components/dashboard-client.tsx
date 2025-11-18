"use client"

import { useState, useEffect } from "react"
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
import type { Candidate, Job, Conversation, SystemPrompt } from "@/lib/types"

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

  const fetchData = async () => {
    try {
      const [candidatesRes, conversationsRes] = await Promise.all([
        fetch("/api/candidates"),
        fetch("/api/conversations"),
      ]);

      if (!candidatesRes.ok || !conversationsRes.ok) {
        throw new Error("Falha ao buscar dados");
      }

      const candidatesData = await candidatesRes.json();
      const conversationsData = await conversationsRes.json();

      setCandidates(candidatesData);
      setConversations(conversationsData);

      // Atualiza a conversa selecionada com os dados mais recentes
      // Usamos o `setState` funcional para acessar o `selectedConversation` mais recente
      setSelectedConversation(currentSelected => {
        if (!currentSelected) return null;
        const updatedConversation = conversationsData.find((c: Conversation) => c.id === currentSelected.id);
        return updatedConversation || null;
      });

    } catch (error) {
      console.error("[v0] Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca os dados iniciais
    fetchData()

    // Configura um intervalo para buscar dados a cada 3 segundos (polling)
    const interval = setInterval(() => {
      console.log("[Polling] Verificando novas mensagens...");
      fetchData()
    }, 3000); // 3000ms = 3 segundos

    // Limpa o intervalo quando o componente é desmontado para evitar vazamentos de memória
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


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
      <Sidebar activeView={activeView} onViewChange={setActiveView} userRole={user.role} userName={user.name} />

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
            onSelectConversation={setSelectedConversation}
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
