# 🔑 Configuração de Tokens do WhatsApp Business API

## Diferença entre User Token e App Token

### User Token (Temporário)
- ✅ Funciona imediatamente após gerar
- ⏱️ **Expira em ~60 dias**
- ⚠️ Não recomendado para produção
- Usado para testes rápidos

### App Token (Permanente) - **RECOMENDADO**
- ✅ **Nunca expira**
- ✅ Ideal para produção
- ⚙️ Requer configuração adicional de permissões
- 🔒 Mais seguro e controlado

---

## 🚨 Problema: App Token não funciona

**Erro típico:**
\`\`\`
Object with ID 'XXXXX' does not exist, cannot be loaded due to missing permissions
\`\`\`

**Causa:** O App Token não tem as permissões necessárias para enviar mensagens.

---

## ✅ Solução: Configurar Permissões do App Token

### Passo 1: Acesse o Meta for Developers
1. Vá para: https://developers.facebook.com/
2. Acesse **Meus Aplicativos**
3. Selecione seu aplicativo do WhatsApp

### Passo 2: Gerar System User Access Token

1. No menu lateral, clique em **System Users** (Usuários do Sistema)
2. Clique em **Add** para criar um novo System User
3. Dê um nome (ex: "Tria+ Production Bot")
4. Selecione a função: **Admin**
5. Clique em **Create System User**

### Passo 3: Atribuir Permissões ao System User

1. Clique no System User que você acabou de criar
2. Clique em **Add Assets** → **Apps**
3. Selecione seu aplicativo WhatsApp
4. Marque as permissões:
   - ✅ **Manage App** (Gerenciar aplicativo)
5. Clique em **Save Changes**

### Passo 4: Atribuir Conta WhatsApp Business

1. No mesmo System User, clique em **Add Assets** → **WhatsApp Accounts**
2. Selecione sua conta WhatsApp Business
3. Marque a permissão:
   - ✅ **Manage WhatsApp Business Account**
4. Clique em **Save Changes**

### Passo 5: Gerar Token Permanente

1. No System User, clique em **Generate New Token**
2. Selecione seu aplicativo WhatsApp
3. Marque as permissões necessárias:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
4. Defina a expiração: **Never** (Nunca expira)
5. Clique em **Generate Token**
6. **⚠️ IMPORTANTE:** Copie o token imediatamente e salve em local seguro

### Passo 6: Atualizar Token no v0

1. No painel v0, vá em **Vars** (sidebar esquerda)
2. Localize a variável `WHATSAPP_ACCESS_TOKEN`
3. Cole o novo token permanente
4. Clique em **Save**

---

## 🧪 Testar a Configuração

1. Acesse a aba **Config. Webhook** no painel Tria+
2. Role até a seção **"Enviar Mensagem de Teste"**
3. Digite seu número de telefone (formato: +5511999999999)
4. Digite uma mensagem de teste
5. Clique em **Enviar Teste**
6. ✅ Se funcionar, sua configuração está correta!

---

## 🔍 Troubleshooting

### Erro: "Invalid OAuth access token"
- **Causa:** Token expirado ou inválido
- **Solução:** Gere um novo token seguindo o Passo 5

### Erro: "Insufficient permissions"
- **Causa:** Faltam permissões no System User
- **Solução:** Revise os Passos 3 e 4, garantindo que todas as permissões foram marcadas

### Erro: "Phone number not registered"
- **Causa:** O número do destinatário não está registrado na API do WhatsApp
- **Solução:** O número precisa ter enviado pelo menos uma mensagem para o bot primeiro

### Token funciona por uns dias e depois para
- **Causa:** Você está usando User Token ao invés de System User Token
- **Solução:** Siga todos os passos acima para gerar um token permanente

---

## 📝 Checklist Final

Antes de ir para produção, confirme:

- [ ] Token gerado via **System User** (não User Token)
- [ ] Permissões `whatsapp_business_management` e `whatsapp_business_messaging` ativadas
- [ ] Token configurado como **Never expire** (Nunca expira)
- [ ] Variável `WHATSAPP_ACCESS_TOKEN` atualizada no v0
- [ ] Teste de envio funcionando na aba **Config. Webhook**
- [ ] Webhook configurado e verificado (ver WHATSAPP_SETUP.md)

---

## 🆘 Precisa de Ajuda?

Se após seguir todos os passos o problema persistir:

1. Verifique se você está usando o **Phone Number ID** correto
2. Confirme que a conta WhatsApp Business está ativa
3. Teste com um User Token temporário para isolar se é problema de permissões
4. Consulte a documentação oficial: https://developers.facebook.com/docs/whatsapp/business-management-api/get-started

---

**Última atualização:** Novembro 2024
