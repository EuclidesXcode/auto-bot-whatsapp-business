# Tria+ - Recrutamento Inteligente

Sistema completo de recrutamento integrado com WhatsApp Business API e IA para automação do processo de triagem de candidatos.

## Funcionalidades

- 🤖 **Chatbot de IA**: Coleta automática de informações dos candidatos via WhatsApp
- 💬 **Conversas em Tempo Real**: Interface estilo messenger para acompanhar todas as conversas
- 👥 **Gestão de Candidatos**: Visualização completa de perfis, filtros avançados e notas
- 💼 **Gestão de Vagas**: Controle de posições abertas e candidatos por vaga
- ⚙️ **System Prompt Configurável**: Personalize o comportamento do chatbot
- 🔐 **Controle de Acesso**: Papéis de admin e recrutador com permissões diferentes
- 🎨 **Upload de Logo**: Sistema permite upload de logo personalizado

## Tecnologias

- **Framework**: Next.js 16 (App Router)
- **UI**: React, Tailwind CSS v4, shadcn/ui
- **IA**: Vercel AI SDK com GPT-4o-mini
- **Integração**: WhatsApp Business API (Meta)
- **Deploy**: TODO

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Adicione no painel da Vercel ou crie um arquivo `.env.local`:

```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
WHATSAPP_VERIFY_TOKEN=seu_verify_token_customizado
```


### 3. Configurar Webhook

Veja o guia completo em [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

### 4. Executar Localmente

```bash
npm run dev
```

Acesse http://localhost:3000

## Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   ├── whatsapp/
│   │   │   ├── webhook/route.ts    # Recebe mensagens do WhatsApp
│   │   │   └── send/route.ts        # Envia mensagens
│   │   ├── candidates/route.ts      # API de candidatos
│   │   ├── conversations/route.ts   # API de conversas
│   │   └── system-prompt/route.ts   # API de configuração
│   └── page.tsx                     # Página principal
├── components/
│   ├── candidate-list.tsx           # Lista de candidatos
│   ├── candidate-details.tsx        # Detalhes do candidato
│   ├── conversation-view.tsx        # Interface de conversas
│   ├── jobs-management.tsx          # Gestão de vagas
│   ├── system-prompt-config.tsx     # Configuração do bot
│   └── logo-upload.tsx              # Componente de upload de logo
├── lib/
│   ├── whatsapp-service.ts          # Serviço WhatsApp
│   ├── ai-service.ts                # Serviço de IA
│   └── types.ts                     # TypeScript types
└── WHATSAPP_SETUP.md                # Guia de configuração
```

## Fluxo de Trabalho

1. Candidato envia mensagem no WhatsApp
2. Webhook recebe e salva a mensagem
3. IA processa e extrai informações
4. Bot responde automaticamente
5. Dados aparecem no painel em tempo real
6. Recrutador pode intervir manualmente
7. Status do candidato é atualizado

## Personalização

### Upload de Logo

O sistema permite upload de logo personalizado:
- Acesse a sidebar e clique em "Upload Logo"
- Escolha uma imagem (PNG, JPG, SVG)
- O logo é salvo localmente no navegador
- Pode ser alterado ou removido a qualquer momento

## Roadmap

- [ ] Banco de dados persistente (Supabase)
- [ ] Autenticação de usuários
- [ ] WebSocket para tempo real
- [ ] Analytics e relatórios
- [ ] Exportação de dados
- [ ] Notificações email
- [ ] Agendamento de entrevistas
- [ ] Integração com calendário

## Licença

MIT
