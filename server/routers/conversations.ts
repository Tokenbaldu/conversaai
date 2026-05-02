import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { conversations, messages, contacts } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const conversationsRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(conversations.userId, ctx.user.id)];
      if (input?.status) conditions.push(eq(conversations.status, input.status as any));
      const convs = await db.select().from(conversations).where(and(...conditions)).orderBy(desc(conversations.lastMessageAt));
      
      // Fetch contacts for each conversation
      const result = await Promise.all(convs.map(async (conv) => {
        const db2 = await getDb();
        if (!db2) return { ...conv, contact: null };
        const [contact] = await db2.select().from(contacts).where(eq(contacts.id, conv.contactId)).limit(1);
        return { ...conv, contact: contact || null };
      }));
      return result;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const [conv] = await db.select().from(conversations).where(and(eq(conversations.id, input.id), eq(conversations.userId, ctx.user.id))).limit(1);
      if (!conv) return null;
      const [contact] = await db.select().from(contacts).where(eq(contacts.id, conv.contactId)).limit(1);
      return { ...conv, contact: contact || null };
    }),

  messages: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(messages).where(eq(messages.conversationId, input.conversationId)).orderBy(desc(messages.sentAt)).limit(input.limit);
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1),
      type: z.enum(["text", "image", "video", "audio", "document"]).default("text"),
      mediaUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(messages).values({
        conversationId: input.conversationId,
        direction: "outbound",
        type: input.type,
        content: input.content,
        mediaUrl: input.mediaUrl || null,
        status: "sent",
      });
      // Update conversation last message
      await db.update(conversations).set({ lastMessageAt: new Date() } as any).where(eq(conversations.id, input.conversationId));
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  create: protectedProcedure
    .input(z.object({
      contactId: z.number(),
      channel: z.enum(["whatsapp", "instagram", "messenger", "web"]).default("web"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(conversations).values({
        userId: ctx.user.id,
        contactId: input.contactId,
        channel: input.channel,
        status: "open",
        lastMessageAt: new Date(),
      });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["open", "resolved", "pending", "bot"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(conversations).set({ status: input.status } as any).where(and(eq(conversations.id, input.id), eq(conversations.userId, ctx.user.id)));
      return { success: true };
    }),

  toggleAutomation: protectedProcedure
    .input(z.object({ id: z.number(), paused: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(conversations).set({ automationPaused: input.paused } as any).where(and(eq(conversations.id, input.id), eq(conversations.userId, ctx.user.id)));
      return { success: true };
    }),
});
