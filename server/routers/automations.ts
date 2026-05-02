import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { automations } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const automationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(automations).where(eq(automations.userId, ctx.user.id)).orderBy(desc(automations.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      triggerType: z.enum(["keyword", "event", "schedule", "new_contact", "tag_added"]),
      triggerConfig: z.any(),
      flowId: z.number().optional(),
      channel: z.enum(["whatsapp", "instagram", "messenger", "all"]).default("all"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(automations).values({
        userId: ctx.user.id,
        name: input.name,
        triggerType: input.triggerType,
        triggerConfig: input.triggerConfig,
        flowId: input.flowId || null,
        channel: input.channel,
        status: "draft",
      });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["active", "paused", "draft"]).optional(),
      triggerConfig: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...data } = input;
      await db.update(automations).set(data as any).where(and(eq(automations.id, id), eq(automations.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(automations).where(and(eq(automations.id, input.id), eq(automations.userId, ctx.user.id)));
      return { success: true };
    }),
});
