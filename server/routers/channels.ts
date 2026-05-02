import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { channels } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const channelsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(channels).where(eq(channels.userId, ctx.user.id));
  }),

  create: protectedProcedure
    .input(z.object({
      type: z.enum(["whatsapp", "instagram", "messenger"]),
      name: z.string().min(1),
      accountId: z.string().optional(),
      accessToken: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(channels).values({
        userId: ctx.user.id,
        type: input.type,
        name: input.name,
        accountId: input.accountId || null,
        accessToken: input.accessToken || null,
        status: "pending",
      });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["connected", "disconnected", "pending"]).optional(),
      config: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...data } = input;
      await db.update(channels).set(data as any).where(and(eq(channels.id, id), eq(channels.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(channels).where(and(eq(channels.id, input.id), eq(channels.userId, ctx.user.id)));
      return { success: true };
    }),
});
