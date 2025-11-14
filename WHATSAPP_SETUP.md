# Configuração do WhatsApp Business API

Este guia explica como configurar a integração com WhatsApp Business API para o painel de recrutamento.

## Pré-requisitos

1. Conta no Meta for Developers (https://developers.facebook.com/)
2. WhatsApp Business Account configurada
3. Aplicativo no Meta App Dashboard

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis de ambiente no seu projeto Vercel:

\`\`\`env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=sua_phone_number_id_aqui
WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui
WHATSAPP_VERIFY_TOKEN=seu_token_de_verificacao_customizado

# Opcional: Para respostas com IA (já incluso via AI Gateway)
# Não é necessário configurar se usar os modelos padrão
\`\`\`

## Passo a Passo

### 1. Criar Aplicativo no Meta for Developers

1. Acesse https://developers.facebook.com/apps
2. Clique em "Criar App"
3. Selecione "Outros" como tipo de app
4. Escolha "Empresa" como caso de uso
5. Preencha as informações do aplicativo

### 2. Adicionar WhatsApp ao App

1. No painel do app, procure por "WhatsApp" nos produtos
2. Clique em "Configurar" para adicionar o produto WhatsApp
3. Siga o assistente de configuração

### 3. Obter Credenciais

**Phone Number ID:**
- Vá em "WhatsApp" > "Introdução"
- Copie o "Phone number ID" exibido
- Cole em `WHATSAPP_PHONE_NUMBER_ID`

**Access Token:**
- Na mesma página, você verá um "Token de acesso temporário"
- Para produção, gere um token permanente em "Configurações" > "Configurações do sistema"
- Cole em `WHATSAPP_ACCESS_TOKEN`

**Verify Token:**
- Crie uma string aleatória segura (ex: `meu_token_secreto_123`)
- Guarde para usar na configuração do webhook
- Cole em `WHATSAPP_VERIFY_TOKEN`

### 4. Configurar Webhook

1. Vá em "WhatsApp" > "Configuração"
2. Em "Webhook", clique em "Configurar"
3. Preencha:
   - **URL de retorno de chamada**: `https://seu-dominio.vercel.app/api/whatsapp/webhook`
   - **Token de verificação**: Use o mesmo valor de `WHATSAPP_VERIFY_TOKEN`
4. Clique em "Verificar e salvar"
5. Inscreva-se nos seguintes campos de webhook:
   - `messages` (obrigatório)
   - `message_status` (opcional, para rastreamento)

### 5. Adicionar Número de Telefone

1. Vá em "WhatsApp" > "Introdução"
2. Adicione um número de telefone de teste
3. Envie uma mensagem teste para verificar a integração

## Testando a Integração

### Teste Manual

1. Envie uma mensagem WhatsApp para o número configurado
2. O webhook deve receber a mensagem em `/api/whatsapp/webhook`
3. A IA irá processar e responder automaticamente
4. A conversa aparecerá no painel

### Teste via cURL

\`\`\`bash
# Enviar mensagem
curl -X POST https://seu-dominio.vercel.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "message": "Olá! Esta é uma mensagem de teste."
  }'
\`\`\`

## Fluxo de Funcionamento

1. **Candidato envia mensagem** → WhatsApp Business API
2. **Webhook recebe** → `/api/whatsapp/webhook`
3. **Mensagem salva** → Store de conversas
4. **IA processa** → Gera resposta baseada no System Prompt
5. **Resposta enviada** → Via WhatsApp Business API
6. **Dados extraídos** → Informações do candidato atualizadas
7. **Painel atualiza** → Polling a cada 5 segundos

## Recursos Implementados

- ✅ Recebimento de mensagens via webhook
- ✅ Envio de mensagens automáticas (bot)
- ✅ Envio manual pelo recrutador
- ✅ Extração automática de informações com IA
- ✅ Armazenamento de conversas
- ✅ Atualização em tempo real (polling)
- ✅ System Prompt configurável

## Limitações do Ambiente de Desenvolvimento

No ambiente de teste do Meta:
- Limite de 1000 conversas/mês (gratuito)
- Apenas números verificados podem receber mensagens
- Mensagens template necessárias após 24h de inatividade

Para produção:
- Solicite aprovação do Meta Business
- Configure mensagens template para notificações
- Implemente rate limiting
- Adicione persistência em banco de dados

## Próximos Passos

1. Substituir stores em memória por banco de dados (Supabase/Neon)
2. Implementar autenticação de usuários
3. Adicionar WebSocket para atualizações em tempo real
4. Configurar mensagens template para notificações
5. Implementar analytics e relatórios

## Troubleshooting

**Webhook não recebe mensagens:**
- Verifique se a URL está correta e acessível
- Confirme que o verify token está correto
- Verifique os logs no Meta App Dashboard

**Erro ao enviar mensagens:**
- Verifique se o access token está válido
- Confirme que o phone_number_id está correto
- Verifique se o número de destino está no formato correto (+5511999999999)

**IA não responde:**
- Verifique os logs no console
- Confirme que o modelo de IA está acessível
- Verifique se há rate limits sendo atingidos

## Suporte

Para mais informações, consulte:
- [Documentação WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Vercel AI SDK](https://sdk.vercel.ai)
