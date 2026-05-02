import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { z } from "zod";

export const aiRouter = router({
  suggestReply: protectedProcedure
    .input(z.object({
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
      context: z.string().optional(),
      tone: z.enum(["formal", "casual", "friendly", "professional"]).default("friendly"),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `Você é um assistente de atendimento ao cliente ${input.tone === "formal" ? "formal e profissional" : input.tone === "casual" ? "casual e descontraído" : input.tone === "friendly" ? "amigável e empático" : "profissional e objetivo"}.
${input.context ? `Contexto do negócio: ${input.context}` : ""}
Gere uma resposta adequada para a conversa. Seja conciso e direto. Responda em português brasileiro.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: "Sugira uma resposta adequada para a última mensagem do cliente. Responda apenas com o texto da sugestão, sem explicações." },
      ];

      const response = await invokeLLM({ messages });
      const suggestion = response.choices[0]?.message?.content || "";
      return { suggestion };
    }),

  analyzeIntent: protectedProcedure
    .input(z.object({
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Analise a intenção da mensagem do cliente e retorne um JSON com: intent (compra, suporte, informação, reclamação, cancelamento, outro), sentiment (positivo, neutro, negativo), urgency (alta, média, baixa), keywords (array de palavras-chave).",
          },
          { role: "user", content: input.message },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "intent_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                intent: { type: "string" },
                sentiment: { type: "string" },
                urgency: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
              },
              required: ["intent", "sentiment", "urgency", "keywords"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === 'string' ? rawContent : "{}";
      try {
        return JSON.parse(content);
      } catch {
        return { intent: "outro", sentiment: "neutro", urgency: "baixa", keywords: [] };
      }
    }),

  generateFlowMessage: protectedProcedure
    .input(z.object({
      purpose: z.string(),
      tone: z.string().default("friendly"),
      channel: z.string().default("whatsapp"),
    }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em copywriting para automação de marketing conversacional. Crie mensagens para ${input.channel} com tom ${input.tone}. Seja conciso, use emojis com moderação e inclua CTAs claros quando necessário.`,
          },
          {
            role: "user",
            content: `Crie uma mensagem para: ${input.purpose}. Responda apenas com o texto da mensagem.`,
          },
        ],
      });
      return { message: response.choices[0]?.message?.content || "" };
    }),

  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })),
      systemPrompt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const msgs = input.systemPrompt
        ? [{ role: "system" as const, content: input.systemPrompt }, ...input.messages.map(m => ({ role: m.role as any, content: m.content }))]
        : input.messages.map(m => ({ role: m.role as any, content: m.content }));

      const response = await invokeLLM({ messages: msgs });
      return { content: response.choices[0]?.message?.content || "" };
    }),
});
