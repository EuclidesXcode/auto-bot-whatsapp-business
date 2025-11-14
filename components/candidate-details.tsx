"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ExternalLink, MapPin, DollarSign, Clock, Award, Trash2 } from "lucide-react"
import type { Candidate, Job } from "@/lib/types"
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
import { useToast } from "@/hooks/use-toast"

interface CandidateDetailsProps {
  candidate: Candidate
  jobs: Job[]
  onClose: () => void
  onDelete?: () => void
}

export function CandidateDetails({ candidate, jobs, onClose, onDelete }: CandidateDetailsProps) {
  const [notes, setNotes] = useState(candidate.notes || "")
  const [status, setStatus] = useState(candidate.status)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  // Declarando a variável job
  const job = jobs.find((job) => job.id === candidate.jobId)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar candidato")
      }

      toast({
        title: "Candidato removido",
        description: "O candidato e suas conversas foram removidos com sucesso.",
      })

      onDelete?.()
      onClose()
    } catch (error) {
      console.error("[v0] Erro ao deletar candidato:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o candidato. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Detalhes do Candidato</h2>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover candidato?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso removerá permanentemente o candidato{" "}
                  <strong>{candidate.name}</strong> e todas as suas conversas do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Removendo..." : "Remover"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Informações Básicas */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-3">Informações Básicas</h3>
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Nome Completo</label>
              <p className="text-foreground font-medium">{candidate.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Telefone</label>
                <p className="text-foreground">{candidate.phone}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-foreground">{candidate.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </label>
              <p className="text-foreground">{candidate.location}</p>
            </div>
          </div>
        </section>

        {/* Perfil Profissional */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-3">Perfil Profissional</h3>
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Cargo Desejado</label>
              <p className="text-foreground font-medium">{candidate.desiredRole}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Senioridade
                </label>
                <p className="text-foreground">{candidate.seniority}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Experiência
                </label>
                <p className="text-foreground">{candidate.yearsOfExperience} anos</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Expectativa Salarial
              </label>
              <p className="text-foreground">{candidate.expectedSalary}</p>
            </div>
            {candidate.linkedinUrl && (
              <div>
                <label className="text-sm text-muted-foreground">LinkedIn / Portfólio</label>
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  {candidate.linkedinUrl}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Status e Vaga */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-3">Status e Vaga</h3>
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status no Funil</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="qualificado">Qualificado</SelectItem>
                  <SelectItem value="em-entrevista">Em entrevista</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="contratado">Contratado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {job && (
              <div>
                <label className="text-sm text-muted-foreground">Vaga Associada</label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium text-foreground">{job.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {job.location} • {job.seniority}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Anotações Internas */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-3">Anotações Internas</h3>
          <Textarea
            placeholder="Adicione anotações sobre o candidato..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="bg-card"
          />
          <Button className="mt-3">Salvar Anotações</Button>
        </section>
      </div>
    </div>
  )
}
