"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MapPin, Briefcase, TrendingUp, Award, User, Info, Building, ChevronRight } from "lucide-react"
import { JobFormDialog } from "@/components/job-form-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Job, Candidate } from "@/lib/types"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface JobsManagementProps {
  userRole: "admin" | "recruiter"
  jobs: Job[]
  candidates: Candidate[]
}

export function JobsManagement({ userRole, jobs, candidates }: JobsManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const { toast } = useToast()

  const openJobs = jobs.filter((job) => job.status === "open")
  const closedJobs = jobs.filter((job) => job.status === "closed")

  useEffect(() => {
    // Seleciona a primeira vaga aberta por padrão
    if (!selectedJob && openJobs.length > 0) {
      setSelectedJob(openJobs[0])
    }
  }, [openJobs, selectedJob])

  const getTopCandidates = (jobId: string) => {
    return candidates
      .filter((c) => c.jobId === jobId && c.score != null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3)
  }

  const handleCloseJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      })
      if (!response.ok) throw new Error("Erro ao fechar vaga")
      toast({ title: "Sucesso", description: "Vaga fechada com sucesso. A lista será atualizada." })
      setSelectedJob(null) // Desseleciona a vaga fechada
    } catch (error) {
      console.error("Erro ao fechar vaga:", error)
      toast({ title: "Erro", description: "Não foi possível fechar a vaga", variant: "destructive" })
    }
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsDialogOpen(true)
  }

  const handleNewJob = () => {
    setEditingJob(null)
    setIsDialogOpen(true)
  }

  return (
    <TooltipProvider>
      <div className="h-full bg-background flex flex-col">
        {/* Cabeçalho da Página */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gestão de Vagas</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {openJobs.length} vagas abertas • {closedJobs.length} fechadas
              </p>
            </div>
            {userRole === "admin" && (
              <Button onClick={handleNewJob}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Vaga
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo Principal (Duas Colunas) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Coluna da Esquerda: Lista de Vagas */}
          <div className="w-96 border-r border-border overflow-y-auto">
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-foreground px-2">Vagas Abertas</h3>
              {openJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedJob?.id === job.id ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <p className="font-semibold text-foreground">{job.title}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.seniority}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coluna da Direita: Detalhes da Vaga e Ranking */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedJob ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{selectedJob.title}</CardTitle>
                      <CardDescription className="mt-2">{selectedJob.description}</CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                      Aberta
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{selectedJob.seniority}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{candidates.filter(c => c.jobId === selectedJob.id).length || 0} candidatos</span>
                    </div>
                  </div>

                  <div className="mb-6"  style={{
                    marginTop: "10px",
                  }}>
                    <p className="text-sm font-medium text-foreground mb-2">Habilidades Requeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.required_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    marginTop: "10px",
                  }}>
                    <h4 className="text-base font-semibold text-foreground mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-yellow-500" />
                      Melhores Candidatos
                    </h4>
                    {getTopCandidates(selectedJob.id).length > 0 ? (
                      <div className="space-y-3">
                        {getTopCandidates(selectedJob.id).map((candidate) => (
                          <Tooltip key={candidate.id} delayDuration={100}>
                            <TooltipTrigger className="w-full p-2 rounded-md hover:bg-accent/50">
                              <div className="flex items-center justify-between text-left">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-foreground">{candidate.name}</p>
                                    <p className="text-xs text-muted-foreground">{candidate.desiredRole}</p>
                                  </div>
                                </div>
                                <Badge variant="default" className="flex items-center gap-1.5 text-sm py-1 px-3">
                                  {candidate.score?.toFixed(1)}
                                  <Info className="h-3 w-3" />
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-bold">Justificativa da IA:</p>
                              <p>{candidate.score_justification || "Nenhuma justificativa fornecida."}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
                        <User className="h-5 w-5" />
                        <span>Ainda não há candidatos com pontuação para esta vaga.</span>
                      </div>
                    )}
                  </div>
                  
                  {userRole === "admin" && (
                    <div className="flex gap-2 mt-6 border-t border-border pt-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(selectedJob)}>Editar</Button>
                      <Button variant="outline" size="sm" onClick={() => handleCloseJob(selectedJob.id)}>Fechar Vaga</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Building className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold">Selecione uma Vaga</h3>
                <p className="max-w-xs">Escolha uma vaga na lista à esquerda para ver seus detalhes e o ranking de candidatos.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <JobFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        job={editingJob}
        onSuccess={() => {
          // Idealmente, o componente pai recarregaria os dados
        }}
      />
    </TooltipProvider>
  )
}
