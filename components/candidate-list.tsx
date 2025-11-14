"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Candidate, Job } from "@/lib/types"
import { getStatusColor } from "@/lib/utils-custom"

interface CandidateListProps {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  onSelectCandidate: (candidate: Candidate) => void
  jobs: Job[]
}

export function CandidateList({ candidates, selectedCandidate, onSelectCandidate, jobs }: CandidateListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [jobFilter, setJobFilter] = useState<string>("all")

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesJob = jobFilter === "all" || candidate.jobId === jobFilter
    return matchesSearch && matchesStatus && matchesJob
  })

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Candidatos</h2>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="qualificado">Qualificado</SelectItem>
              <SelectItem value="em-entrevista">Em entrevista</SelectItem>
              <SelectItem value="proposta">Proposta</SelectItem>
              <SelectItem value="contratado">Contratado</SelectItem>
              <SelectItem value="reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Vaga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as vagas</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCandidates.map((candidate) => {
          const job = jobs.find((j) => j.id === candidate.jobId)
          const isSelected = selectedCandidate?.id === candidate.id

          return (
            <button
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate)}
              className={`w-full p-4 border-b border-border text-left hover:bg-accent transition-colors ${
                isSelected ? "bg-accent" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.desiredRole}</p>
                </div>
                <Badge variant="secondary" className={getStatusColor(candidate.status)}>
                  {candidate.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{candidate.seniority}</span>
                <span>•</span>
                <span>{candidate.location}</span>
                <span>•</span>
                <span>{candidate.yearsOfExperience} anos exp.</span>
              </div>

              {job && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {job.title}
                  </Badge>
                </div>
              )}

              <div className="mt-2 text-xs text-muted-foreground">
                Última mensagem: {new Date(candidate.lastMessageAt).toLocaleDateString("pt-BR")}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
