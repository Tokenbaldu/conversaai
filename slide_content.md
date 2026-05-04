# ConversaIA.Cloud - Tutorial de Setup

## Slide 1: Bem-vindo ao ConversaIA.Cloud

**Título:** ConversaIA.Cloud - Plataforma de Automação Conversacional

**Conteúdo:**
- Plataforma completa de automação com IA
- Gerenciamento multicanal (WhatsApp, Instagram, Messenger)
- Flow builder visual com drag-and-drop
- Integração com OAuth e Stripe
- Pronto para produção

**Imagem:** Logo ConversaIA.Cloud

---

## Slide 2: Requisitos do Sistema

**Título:** O que você precisa

**Conteúdo:**
- Node.js 22.13.0 ou superior
- pnpm (gerenciador de pacotes)
- Banco de dados TiDB Cloud ou MySQL
- Git (opcional, para controle de versão)
- Editor de código (VS Code recomendado)

**Nota:** Todos esses requisitos estão disponíveis gratuitamente

---

## Slide 3: Passo 1 - Download e Descompactação

**Título:** Preparando o Ambiente

**Conteúdo:**
1. Baixe o arquivo `conversaai-complete.zip`
2. Descompacte em uma pasta de sua escolha
3. Abra o terminal/prompt de comando
4. Navegue até a pasta do projeto:
   ```
   cd conversaai
   ```

**Dica:** Use um editor como VS Code para melhor experiência

---

## Slide 4: Passo 2 - Instalar Dependências

**Título:** Instalando Pacotes

**Conteúdo:**
Execute o comando:
```
pnpm install
```

**O que acontece:**
- Baixa todas as dependências do projeto
- Instala React, Express, tRPC, Tailwind, etc.
- Cria pasta `node_modules/`
- Pode levar 2-5 minutos

**Dica:** Certifique-se de ter conexão com internet

---

## Slide 5: Passo 3 - Configurar Variáveis de Ambiente

**Título:** Arquivo .env

**Conteúdo:**
1. Crie um arquivo `.env` na raiz do projeto
2. Copie o conteúdo de `.env.example` (se existir)
3. Preencha as variáveis obrigatórias:
   - `DATABASE_URL`: Conexão com banco de dados
   - `JWT_SECRET`: Chave para sessões
   - `VITE_APP_ID`: ID da aplicação OAuth
   - `STRIPE_SECRET_KEY`: Chave Stripe (se usar pagamentos)

**Aviso:** Nunca compartilhe o arquivo `.env` publicamente

---

## Slide 6: Passo 4 - Banco de Dados

**Título:** Configurar Banco de Dados

**Conteúdo:**
1. Crie uma instância no TiDB Cloud (gratuita)
2. Obtenha a string de conexão
3. Cole em `DATABASE_URL` no `.env`
4. Execute as migrações:
   ```
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

**Alternativa:** Use MySQL local para desenvolvimento

---

## Slide 7: Passo 5 - Iniciar o Servidor

**Título:** Rodando o Projeto

**Conteúdo:**
Execute:
```
pnpm dev
```

**Saída esperada:**
```
Server running on http://localhost:3000/
Vite dev server ready
```

**Acesse:** http://localhost:3000 no seu navegador

---

## Slide 8: Passo 6 - Autenticação OAuth

**Título:** Configurar Manus OAuth

**Conteúdo:**
1. Acesse o painel admin
2. Vá para Configurações → OAuth
3. Crie uma nova aplicação OAuth
4. Copie Client ID e Client Secret
5. Configure Redirect URI:
   ```
   http://localhost:3000/api/oauth/callback
   ```

**Para produção:** Use seu domínio real

---

## Slide 9: Passo 7 - Stripe (Opcional)

**Título:** Integração de Pagamentos

**Conteúdo:**
1. Crie conta em stripe.com
2. Obtenha chaves de teste
3. Configure em `.env`:
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
4. Acesse Configurações → Stripe no painel admin

**Teste:** Use cartão 4242 4242 4242 4242

---

## Slide 10: Estrutura do Projeto

**Título:** Conhecendo o Projeto

**Conteúdo:**
```
conversaai/
├── client/          # Frontend React
│   ├── src/
│   │   ├── pages/   # Páginas da aplicação
│   │   ├── components/
│   │   └── App.tsx
│   └── index.html
├── server/          # Backend Express + tRPC
│   ├── routers.ts   # Endpoints da API
│   ├── db.ts        # Queries do banco
│   └── _core/
├── drizzle/         # Schema do banco
├── package.json
└── .env
```

---

## Slide 11: Comandos Úteis

**Título:** Comandos Essenciais

**Conteúdo:**
```
pnpm dev              # Iniciar desenvolvimento
pnpm build            # Build para produção
pnpm test             # Rodar testes
pnpm lint             # Verificar código
pnpm type-check       # Verificar tipos TypeScript
```

**Dica:** Use `pnpm --help` para mais informações

---

## Slide 12: Primeiros Passos na Plataforma

**Título:** Explorando ConversaIA.Cloud

**Conteúdo:**
1. **Dashboard** - Visualize métricas e atividades
2. **Flows** - Crie fluxos de automação
3. **Contatos** - Gerencie seu CRM
4. **Canais** - Conecte WhatsApp, Instagram, Messenger
5. **Planos** - Configure modelos de preço
6. **Admin** - Gerencie usuários e configurações

**Dica:** Comece criando um fluxo simples

---

## Slide 13: Troubleshooting - Erros Comuns

**Título:** Resolvendo Problemas

**Conteúdo:**
**Erro: "Cannot find module"**
- Solução: `pnpm install`

**Erro: "DATABASE_URL not found"**
- Solução: Configure `.env` corretamente

**Erro: "Port 3000 already in use"**
- Solução: `pnpm dev --port 3001`

**Erro: "OAuth callback failed"**
- Solução: Verifique Redirect URI no `.env`

---

## Slide 14: Deploy em Produção

**Título:** Levando para Produção

**Conteúdo:**
1. **Build:** `pnpm build`
2. **Escolha uma plataforma:**
   - Vercel (recomendado para Next.js)
   - Railway (fácil para Express)
   - Render (alternativa gratuita)
   - Sua própria VPS

3. **Configure variáveis de ambiente**
4. **Configure domínio customizado**
5. **Ative HTTPS**

---

## Slide 15: Recursos Adicionais

**Título:** Documentação e Suporte

**Conteúdo:**
- **Documentação:** Veja README.md no projeto
- **Testes:** Execute `pnpm test` para validar
- **Logs:** Verifique `.manus-logs/` para erros
- **GitHub:** Sincronize com seu repositório
- **Comunidade:** Participe de fóruns de desenvolvimento

**Contato:** Suporte disponível em help.manus.im

---

## Slide 16: Parabéns! 🎉

**Título:** Você está pronto!

**Conteúdo:**
✅ Projeto configurado
✅ Servidor rodando
✅ Banco de dados conectado
✅ OAuth funcionando
✅ Pronto para desenvolvimento

**Próximos passos:**
- Customize a interface
- Adicione seus próprios fluxos
- Integre com seus serviços
- Faça deploy em produção

**Boa sorte com ConversaIA.Cloud! 🚀**
