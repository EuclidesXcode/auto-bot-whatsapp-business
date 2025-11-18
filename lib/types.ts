export type CandidateStatus = "novo" | "qualificado" | "em-entrevista" | "proposta" | "contratado" | "reprovado"

export interface Candidate {
  id: string
  name: string
  phone: string
  email: string
  desiredRole: string
  yearsOfExperience: number
  expectedSalary: string
  location: string
  linkedinUrl?: string
  seniority: string
  status: CandidateStatus
  jobId?: string
  notes?: string
  lastMessageAt: string
  bot_status?: "active" | "inactive"
}

export interface Job {
  id: string
  title: string
  description: string
  requiredSkills: string[]
  seniority: string
  location: string
  status: "open" | "closed"
  candidateCount: number
}

export interface Message {
  id: string
  sender: "candidate" | "bot" | "recruiter"
  text: string
  timestamp: string
}

export interface Conversation {
  id: string
  candidateId: string
  candidateName: string
  candidatePhone: string
  messages: Message[]
}

export interface SystemPrompt {
  content: string
  updatedAt: string
  updatedBy: string
}
