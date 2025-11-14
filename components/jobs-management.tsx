"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MapPin, Briefcase, TrendingUp, Loader2 } from 'lucide-react'
import { JobFormDialog } from "@/components/job-form-dialog"
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string
  title: string
  description: string
  seniority: string
  location: string
  required_skills: string[]
  status: "open" | "closed"
  candidateCount?: number
}

interface JobsManagementProps {
  userRole: "admin" | "recruiter"
}

export function JobsManagement({ userRole }: JobsManagementProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const { toast } = useToast()

  const loadJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      if (!response.ok) throw new Error("Erro ao carregar vagas")
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error("[v0] Erro ao carregar vagas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vagas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const handleCloseJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      })

      if (!response.ok) throw new Error("Erro ao fechar vaga")

      toast({
        title: "Sucesso",
        description: "Vaga fechada com sucesso",
      })

      loadJobs()
    } catch (error) {
      console.error("[v0] Erro ao fechar vaga:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fechar a vaga",
        variant: "destructive",
      })
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

  const openJobs = jobs.filter((job) => job.status === "open")
  const closedJobs = jobs.filter((job) => job.status === "closed")

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
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

      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Vagas Abertas</h3>
        <div className="grid gap-4 mb-8">
          {openJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="mt-2">{job.description}</CardDescription>
                  </div>
                  <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Aberta
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.seniority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{job.candidateCount || 0} candidatos</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Habilidades Requeridas</p>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {userRole === "admin" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(job)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCloseJob(job.id)}>
                      Fechar Vaga
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {closedJobs.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-foreground mb-4">Vagas Fechadas</h3>
            <div className="grid gap-4">
              {closedJobs.map((job) => (
                <Card key={job.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-2">{job.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">Fechada</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.seniority}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <JobFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        job={editingJob}
        onSuccess={loadJobs}
      />
    </div>
  )
}
