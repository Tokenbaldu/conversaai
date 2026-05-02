# ConversaAI - TODO

## Fase 1: Schema do Banco de Dados
- [x] Tabela contacts (contatos com campos customizados)
- [x] Tabela tags e contact_tags (segmentação)
- [x] Tabela flows (fluxos de automação)
- [x] Tabela flow_nodes (nós do flow builder)
- [x] Tabela flow_edges (conexões entre nós)
- [x] Tabela automations (regras de automação com triggers)
- [x] Tabela conversations (conversas por canal)
- [x] Tabela messages (mensagens das conversas)
- [x] Tabela broadcasts (campanhas de disparo em massa)
- [x] Tabela broadcast_recipients (destinatários de broadcast)
- [x] Tabela channels (canais conectados: WhatsApp, Instagram, Messenger)
- [x] Tabela plans (planos SaaS: Free, Pro, Agency)
- [x] Tabela user_plans (plano atual do usuário)
- [x] Tabela flow_templates (biblioteca de templates)
- [x] Tabela media_files (arquivos de mídia uploadados)
- [x] Tabela analytics_events (eventos de analytics)

## Fase 2: Layout e Navegação
- [x] Landing page elegante com hero, features, pricing
- [x] AppLayout com sidebar sofisticada e colapsável
- [x] Tema dark premium com paleta de cores refinada (OKLCH)
- [x] Tipografia Plus Jakarta Sans + Inter
- [x] Roteamento completo do dashboard (15 rotas)

## Fase 3: Flow Builder
- [x] Canvas drag-and-drop com @xyflow/react
- [x] Nós: Mensagem, Condição, Ação, Delay, Início
- [x] Painel lateral de propriedades do nó
- [x] Conexões entre nós com setas
- [x] Salvamento automático do fluxo
- [x] Listagem e criação de fluxos

## Fase 4: Contatos (CRM)
- [x] Listagem de contatos com filtros e busca
- [x] Criação e edição de contatos
- [x] Campos customizados por contato
- [x] Sistema de tags (adicionar/remover)
- [x] Histórico de interações do contato
- [x] Segmentação por tags e comportamento

## Fase 5: Automações, Triggers e Broadcast
- [x] Listagem e criação de automações
- [x] Triggers: palavra-chave, evento, horário
- [x] Sequências de mensagens com delay
- [x] Broadcast: criação de campanha
- [x] Broadcast: seleção de segmento e agendamento
- [x] Broadcast: histórico de campanhas e métricas

## Fase 6: Chat ao Vivo e IA
- [x] Inbox unificado com lista de conversas
- [x] Janela de chat com histórico completo
- [x] IA: sugestão de resposta com LLM
- [x] IA: análise de intenção da mensagem
- [x] Upload de mídia (imagens, vídeos, documentos)
- [x] Página de IA com configuração de assistente e testes

## Fase 7: Analytics, Planos, Templates e Canais
- [x] Dashboard de analytics com métricas principais
- [x] Gráficos de engajamento e conversão (Recharts)
- [x] Página de planos SaaS (Free, Pro, Agency)
- [x] Biblioteca de templates de fluxos
- [x] Tela de canais multicanal (WhatsApp, Instagram, Messenger)
- [x] Configuração de canal conectado
- [x] Notificações ao admin: novo usuário, plano contratado

## Fase 8: Qualidade e Entrega
- [x] Testes Vitest para procedures principais (10 testes passando)
- [x] Estados de loading e erro em todas as telas
- [x] Página de Settings com perfil e notificações
- [x] Checkpoint final e entrega


## Fase 9: Integração de Canais
- [x] Adicionar botões de integração no menu lateral
- [x] Criar página de Integrações com cards para cada canal
- [x] Implementar OAuth flow para WhatsApp Business API
- [x] Implementar OAuth flow para Instagram Graph API
- [x] Implementar OAuth flow para Facebook Messenger
- [x] Criar testes para validar integração de canais (19 testes)
- [x] Testar fluxo completo de autenticação
