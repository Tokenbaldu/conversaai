import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { flowTemplates, flows } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const defaultTemplates = [
  {
    name: "Boas-vindas",
    description: "Fluxo de boas-vindas para novos contatos com apresentação da empresa.",
    category: "welcome",
    nodes: [
      { id: "start", type: "startNode", position: { x: 250, y: 50 }, data: { label: "Início" } },
      { id: "msg1", type: "messageNode", position: { x: 250, y: 180 }, data: { label: "Mensagem", content: "Olá! Seja bem-vindo(a)! 👋\n\nSou o assistente virtual da empresa. Como posso te ajudar hoje?" } },
      { id: "btn1", type: "buttonNode", position: { x: 250, y: 320 }, data: { label: "Botões", buttons: ["Ver produtos", "Falar com atendente", "Mais informações"] } },
    ],
    edges: [
      { id: "e1", source: "start", target: "msg1" },
      { id: "e2", source: "msg1", target: "btn1" },
    ],
  },
  {
    name: "Captura de Leads",
    description: "Coleta nome, email e telefone do contato para geração de leads qualificados.",
    category: "leads",
    nodes: [
      { id: "start", type: "startNode", position: { x: 250, y: 50 }, data: { label: "Início" } },
      { id: "msg1", type: "messageNode", position: { x: 250, y: 180 }, data: { label: "Mensagem", content: "Olá! Para te ajudar melhor, preciso de algumas informações. Qual é o seu nome?" } },
      { id: "action1", type: "actionNode", position: { x: 250, y: 320 }, data: { label: "Salvar Nome", action: "save_field", field: "name" } },
      { id: "msg2", type: "messageNode", position: { x: 250, y: 460 }, data: { label: "Mensagem", content: "Perfeito! Qual é o seu email?" } },
      { id: "action2", type: "actionNode", position: { x: 250, y: 600 }, data: { label: "Salvar Email", action: "save_field", field: "email" } },
    ],
    edges: [
      { id: "e1", source: "start", target: "msg1" },
      { id: "e2", source: "msg1", target: "action1" },
      { id: "e3", source: "action1", target: "msg2" },
      { id: "e4", source: "msg2", target: "action2" },
    ],
  },
  {
    name: "Suporte ao Cliente",
    description: "Triagem automática de solicitações de suporte com opções de menu.",
    category: "support",
    nodes: [
      { id: "start", type: "startNode", position: { x: 250, y: 50 }, data: { label: "Início" } },
      { id: "msg1", type: "messageNode", position: { x: 250, y: 180 }, data: { label: "Mensagem", content: "Olá! Estou aqui para te ajudar. Qual é o seu problema?" } },
      { id: "cond1", type: "conditionNode", position: { x: 250, y: 320 }, data: { label: "Condição", condition: "contains", value: "entrega" } },
      { id: "msg2", type: "messageNode", position: { x: 100, y: 460 }, data: { label: "Entrega", content: "Entendido! Vou verificar o status da sua entrega. Qual é o número do pedido?" } },
      { id: "msg3", type: "messageNode", position: { x: 400, y: 460 }, data: { label: "Outro", content: "Vou te conectar com um atendente especializado. Aguarde um momento..." } },
    ],
    edges: [
      { id: "e1", source: "start", target: "msg1" },
      { id: "e2", source: "msg1", target: "cond1" },
      { id: "e3", source: "cond1", target: "msg2", label: "Sim" },
      { id: "e4", source: "cond1", target: "msg3", label: "Não" },
    ],
  },
  {
    name: "Carrinho Abandonado",
    description: "Recupera clientes que abandonaram o carrinho com mensagem personalizada.",
    category: "sales",
    nodes: [
      { id: "start", type: "startNode", position: { x: 250, y: 50 }, data: { label: "Início" } },
      { id: "delay1", type: "delayNode", position: { x: 250, y: 180 }, data: { label: "Aguardar", delay: 60, unit: "minutes" } },
      { id: "msg1", type: "messageNode", position: { x: 250, y: 320 }, data: { label: "Lembrete", content: "Oi! Notei que você deixou alguns itens no carrinho 🛒\n\nSua seleção está te esperando! Finalize sua compra agora e ganhe frete grátis." } },
      { id: "btn1", type: "buttonNode", position: { x: 250, y: 460 }, data: { label: "CTA", buttons: ["Finalizar compra", "Ver carrinho", "Não tenho interesse"] } },
    ],
    edges: [
      { id: "e1", source: "start", target: "delay1" },
      { id: "e2", source: "delay1", target: "msg1" },
      { id: "e3", source: "msg1", target: "btn1" },
    ],
  },
  {
    name: "Agendamento",
    description: "Fluxo para agendamento de consultas, reuniões ou serviços.",
    category: "scheduling",
    nodes: [
      { id: "start", type: "startNode", position: { x: 250, y: 50 }, data: { label: "Início" } },
      { id: "msg1", type: "messageNode", position: { x: 250, y: 180 }, data: { label: "Mensagem", content: "Ótimo! Vamos agendar o seu horário. Qual data você prefere?" } },
      { id: "action1", type: "actionNode", position: { x: 250, y: 320 }, data: { label: "Salvar Data", action: "save_field", field: "appointment_date" } },
      { id: "msg2", type: "messageNode", position: { x: 250, y: 460 }, data: { label: "Confirmação", content: "Perfeito! Seu agendamento foi confirmado. Você receberá um lembrete 24h antes. ✅" } },
    ],
    edges: [
      { id: "e1", source: "start", target: "msg1" },
      { id: "e2", source: "msg1", target: "action1" },
      { id: "e3", source: "action1", target: "msg2" },
    ],
  },
  {
    name: "Pesquisa de Satisfação",
    description: "Coleta feedback dos clientes após atendimento ou compra.",
    category: "feedback",
    nodes: [
      { id: "start", type: "startNode", position: { x: 250, y: 50 }, data: { label: "Início" } },
      { id: "msg1", type: "messageNode", position: { x: 250, y: 180 }, data: { label: "Pesquisa", content: "Olá! Como foi sua experiência conosco? Avalie de 1 a 5 ⭐" } },
      { id: "cond1", type: "conditionNode", position: { x: 250, y: 320 }, data: { label: "Nota Alta?", condition: "greater_than", value: "3" } },
      { id: "msg2", type: "messageNode", position: { x: 100, y: 460 }, data: { label: "Positivo", content: "Que ótimo! Ficamos felizes com sua avaliação! 😊 Obrigado pelo feedback!" } },
      { id: "msg3", type: "messageNode", position: { x: 400, y: 460 }, data: { label: "Negativo", content: "Sentimos muito pela experiência. Um atendente entrará em contato para resolver sua situação." } },
    ],
    edges: [
      { id: "e1", source: "start", target: "msg1" },
      { id: "e2", source: "msg1", target: "cond1" },
      { id: "e3", source: "cond1", target: "msg2", label: "Sim" },
      { id: "e4", source: "cond1", target: "msg3", label: "Não" },
    ],
  },
];

export const templatesRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return defaultTemplates.map((t, i) => ({ ...t, id: i + 1, isPublic: true, thumbnail: null, createdAt: new Date() }));
      
      const dbTemplates = await db.select().from(flowTemplates).where(eq(flowTemplates.isPublic, true));
      if (dbTemplates.length === 0) return defaultTemplates.map((t, i) => ({ ...t, id: i + 1, isPublic: true, thumbnail: null, createdAt: new Date() }));
      
      if (input?.category) return dbTemplates.filter(t => t.category === input.category);
      return dbTemplates;
    }),

  useTemplate: protectedProcedure
    .input(z.object({ templateId: z.number(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Get template from DB or defaults
      let template = defaultTemplates[input.templateId - 1];
      if (!template) {
        const [dbTemplate] = await db.select().from(flowTemplates).where(eq(flowTemplates.id, input.templateId)).limit(1);
        if (dbTemplate) template = dbTemplate as any;
      }
      if (!template) throw new Error("Template not found");

      const result = await db.insert(flows).values({
        userId: ctx.user.id,
        name: input.name || template.name,
        description: template.description || null,
        nodes: template.nodes,
        edges: template.edges,
        status: "draft",
        triggerType: "manual",
      });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),
});
