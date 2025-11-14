import type { Candidate, Job, Conversation, SystemPrompt } from "./types"

export const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Ana Silva",
    phone: "+55 11 98765-4321",
    email: "ana.silva@email.com",
    desiredRole: "Desenvolvedora Full Stack",
    yearsOfExperience: 5,
    expectedSalary: "R$ 10.000 - R$ 12.000",
    location: "São Paulo, SP",
    linkedinUrl: "https://linkedin.com/in/anasilva",
    seniority: "Pleno",
    status: "qualificado",
    jobId: "1",
    notes: "Excelente perfil técnico, experiência com React e Node.js",
    lastMessageAt: "2025-01-13T14:30:00",
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    phone: "+55 21 91234-5678",
    email: "carlos.oliveira@email.com",
    desiredRole: "Engenheiro de Dados",
    yearsOfExperience: 7,
    expectedSalary: "R$ 15.000 - R$ 18.000",
    location: "Rio de Janeiro, RJ",
    linkedinUrl: "https://linkedin.com/in/carlosoliveira",
    seniority: "Sênior",
    status: "em-entrevista",
    jobId: "2",
    lastMessageAt: "2025-01-13T10:15:00",
  },
  {
    id: "3",
    name: "Marina Santos",
    phone: "+55 11 99876-5432",
    email: "marina.santos@email.com",
    desiredRole: "Designer UX/UI",
    yearsOfExperience: 3,
    expectedSalary: "R$ 7.000 - R$ 9.000",
    location: "Remoto",
    linkedinUrl: "https://linkedin.com/in/marinasantos",
    seniority: "Júnior",
    status: "novo",
    jobId: "3",
    lastMessageAt: "2025-01-13T16:45:00",
  },
  {
    id: "4",
    name: "Pedro Costa",
    phone: "+55 48 98765-1234",
    email: "pedro.costa@email.com",
    desiredRole: "Desenvolvedor Backend",
    yearsOfExperience: 4,
    expectedSalary: "R$ 9.000 - R$ 11.000",
    location: "Florianópolis, SC",
    seniority: "Pleno",
    status: "proposta",
    jobId: "1",
    lastMessageAt: "2025-01-12T09:20:00",
  },
  {
    id: "5",
    name: "Julia Ferreira",
    phone: "+55 31 97654-3210",
    email: "julia.ferreira@email.com",
    desiredRole: "Product Manager",
    yearsOfExperience: 6,
    expectedSalary: "R$ 12.000 - R$ 15.000",
    location: "Belo Horizonte, MG",
    seniority: "Sênior",
    status: "qualificado",
    jobId: "4",
    lastMessageAt: "2025-01-13T11:00:00",
  },
]

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Desenvolvedor Full Stack",
    description:
      "Buscamos desenvolvedor com experiência em React, Node.js e PostgreSQL para trabalhar em projetos desafiadores.",
    requiredSkills: ["React", "Node.js", "PostgreSQL", "TypeScript", "Docker"],
    seniority: "Pleno/Sênior",
    location: "São Paulo, SP - Híbrido",
    status: "open",
    candidateCount: 12,
  },
  {
    id: "2",
    title: "Engenheiro de Dados",
    description: "Profissional para construir e manter pipelines de dados escaláveis usando tecnologias modernas.",
    requiredSkills: ["Python", "Apache Spark", "AWS", "SQL", "Airflow"],
    seniority: "Sênior",
    location: "Remoto",
    status: "open",
    candidateCount: 8,
  },
  {
    id: "3",
    title: "Designer UX/UI",
    description: "Designer criativo para criar experiências digitais incríveis para nossos produtos.",
    requiredSkills: ["Figma", "Design System", "Prototipagem", "User Research"],
    seniority: "Júnior/Pleno",
    location: "São Paulo, SP - Remoto",
    status: "open",
    candidateCount: 15,
  },
  {
    id: "4",
    title: "Product Manager",
    description: "Gerente de produto para liderar o desenvolvimento de novos recursos e melhorias.",
    requiredSkills: ["Product Strategy", "Agile", "Analytics", "Stakeholder Management"],
    seniority: "Sênior",
    location: "São Paulo, SP - Híbrido",
    status: "open",
    candidateCount: 6,
  },
  {
    id: "5",
    title: "Desenvolvedor Mobile",
    description: "Desenvolvimento de aplicativos móveis nativos e multiplataforma.",
    requiredSkills: ["React Native", "iOS", "Android", "JavaScript"],
    seniority: "Pleno",
    location: "Rio de Janeiro, RJ",
    status: "closed",
    candidateCount: 20,
  },
]

export const mockConversations: Conversation[] = [
  {
    id: "1",
    candidateId: "1",
    candidateName: "Ana Silva",
    candidatePhone: "+55 11 98765-4321",
    messages: [
      {
        id: "1",
        sender: "bot",
        text: "Olá! Bem-vindo ao processo seletivo. Vou fazer algumas perguntas para conhecer melhor seu perfil. Qual é o seu nome completo?",
        timestamp: "2025-01-13T14:00:00",
      },
      {
        id: "2",
        sender: "candidate",
        text: "Meu nome é Ana Silva",
        timestamp: "2025-01-13T14:01:00",
      },
      {
        id: "3",
        sender: "bot",
        text: "Prazer, Ana! Qual cargo você está buscando?",
        timestamp: "2025-01-13T14:01:30",
      },
      {
        id: "4",
        sender: "candidate",
        text: "Estou buscando uma vaga como Desenvolvedora Full Stack",
        timestamp: "2025-01-13T14:02:00",
      },
      {
        id: "5",
        sender: "bot",
        text: "Ótimo! Quantos anos de experiência você tem nessa área?",
        timestamp: "2025-01-13T14:02:30",
      },
      {
        id: "6",
        sender: "candidate",
        text: "Tenho 5 anos de experiência",
        timestamp: "2025-01-13T14:03:00",
      },
      {
        id: "7",
        sender: "recruiter",
        text: "Olá Ana! Vi seu perfil e gostaria de agendar uma entrevista. Você tem disponibilidade na próxima semana?",
        timestamp: "2025-01-13T14:30:00",
      },
    ],
  },
  {
    id: "2",
    candidateId: "2",
    candidateName: "Carlos Oliveira",
    candidatePhone: "+55 21 91234-5678",
    messages: [
      {
        id: "1",
        sender: "bot",
        text: "Olá! Bem-vindo ao processo seletivo. Qual é o seu nome completo?",
        timestamp: "2025-01-13T09:00:00",
      },
      {
        id: "2",
        sender: "candidate",
        text: "Carlos Oliveira",
        timestamp: "2025-01-13T09:01:00",
      },
      {
        id: "3",
        sender: "bot",
        text: "Qual posição você está buscando?",
        timestamp: "2025-01-13T09:01:30",
      },
      {
        id: "4",
        sender: "candidate",
        text: "Engenheiro de Dados",
        timestamp: "2025-01-13T09:02:00",
      },
    ],
  },
  {
    id: "3",
    candidateId: "3",
    candidateName: "Marina Santos",
    candidatePhone: "+55 11 99876-5432",
    messages: [
      {
        id: "1",
        sender: "bot",
        text: "Olá! Vamos começar sua candidatura. Qual é o seu nome?",
        timestamp: "2025-01-13T16:30:00",
      },
      {
        id: "2",
        sender: "candidate",
        text: "Marina Santos",
        timestamp: "2025-01-13T16:31:00",
      },
      {
        id: "3",
        sender: "bot",
        text: "Prazer, Marina! Para qual vaga você está se candidatando?",
        timestamp: "2025-01-13T16:31:30",
      },
      {
        id: "4",
        sender: "candidate",
        text: "Designer UX/UI",
        timestamp: "2025-01-13T16:45:00",
      },
    ],
  },
]

export const mockSystemPrompt: SystemPrompt = {
  content: `Você é um assistente de recrutamento amigável e profissional chamado RecrutaBot.

Sua missão é conduzir uma conversa natural com os candidatos para coletar as seguintes informações obrigatórias:
1. Nome completo
2. Cargo desejado
3. Anos de experiência na área
4. Expectativa salarial (faixa de valores)
5. Localização (cidade/estado ou preferência por trabalho remoto)
6. Link do LinkedIn ou portfólio online

DIRETRIZES DE CONVERSAÇÃO:
- Seja cordial, mas profissional
- Faça uma pergunta por vez para não sobrecarregar o candidato
- Use linguagem clara e direta em português brasileiro
- Se o candidato fornecer informações incompletas, peça gentilmente mais detalhes
- Confirme as informações importantes antes de prosseguir
- Ao final da coleta, agradeça e informe que um recrutador entrará em contato em breve

TOM DE VOZ:
- Profissional, mas acolhedor
- Claro e objetivo
- Positivo e encorajador

EXEMPLO DE FLUXO:
1. Saudação inicial e apresentação
2. Coleta do nome
3. Cargo desejado
4. Experiência profissional
5. Expectativa salarial
6. Localização
7. LinkedIn/Portfólio
8. Agradecimento e próximos passos

Lembre-se: você está representando a empresa, então mantenha sempre um tom respeitoso e profissional.`,
  updatedAt: "2025-01-10T15:30:00",
  updatedBy: "admin@recrutaai.com",
}
