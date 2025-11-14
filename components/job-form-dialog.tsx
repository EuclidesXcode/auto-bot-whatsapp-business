"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string
  title: string
  description: string
  seniority: string
  location: string
  required_skills: string[]
  status: "open" | "closed"
}

interface JobFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job | null
  onSuccess: () => void
}

export function JobFormDialog({ open, onOpenChange, job, onSuccess }: JobFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [seniority, setSeniority] = useState("")
  const [location, setLocation] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (job) {
      setTitle(job.title)
      setDescription(job.description)
      setSeniority(job.seniority)
      setLocation(job.location)
      setSkills(job.required_skills)
    } else {
      setTitle("")
      setDescription("")
      setSeniority("")
      setLocation("")
      setSkills([])
    }
    setSkillInput("")
  }, [job, open])

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        title,
        description,
        seniority,
        location,
        required_skills: skills,
      }

      const url = job ? `/api/jobs/${job.id}` : "/api/jobs"
      const method = job ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Erro ao salvar vaga")

      toast({
        title: "Sucesso",
        description: job ? "Vaga atualizada com sucesso" : "Vaga criada com sucesso",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Erro ao salvar vaga:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a vaga",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Editar Vaga" : "Nova Vaga"}</DialogTitle>
          <DialogDescription>
            {job ? "Atualize as informações da vaga" : "Preencha os dados da nova vaga"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Vaga *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Desenvolvedor Full Stack"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as responsabilidades e requisitos da vaga..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seniority">Senioridade *</Label>
              <Select value={seniority} onValueChange={setSeniority} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Júnior">Júnior</SelectItem>
                  <SelectItem value="Pleno">Pleno</SelectItem>
                  <SelectItem value="Sênior">Sênior</SelectItem>
                  <SelectItem value="Especialista">Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Remoto, São Paulo, etc."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Habilidades Requeridas</Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Digite uma habilidade e pressione Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Adicionar
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSkill(skill)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {job ? "Atualizar" : "Criar"} Vaga
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
