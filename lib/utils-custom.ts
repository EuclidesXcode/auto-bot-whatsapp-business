import type { CandidateStatus } from "./types"

export function getStatusColor(status: CandidateStatus): string {
  const colors: Record<CandidateStatus, string> = {
    novo: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    qualificado: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "em-entrevista": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    proposta: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    contratado: "bg-green-500/10 text-green-600 border-green-500/20",
    reprovado: "bg-red-500/10 text-red-600 border-red-500/20",
  }

  return colors[status] || ""
}
