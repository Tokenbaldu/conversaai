import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { channels } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const channelsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const userChannels = await db.select().from(channels).where(eq(channels.userId, ctx.user.id));
    
    // Remove duplicatas mantendo apenas a mais recente
    const seen = new Map<string, any>();
    const filtered = userChannels.filter(ch => {
      const key = `${ch.type}-${ch.accountId || ch.name}`;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      
      // Verificar se já existe um canal com o mesmo tipo e accountId
      const existing = await db.select().from(channels).where(
        and(
          eq(channels.userId, ctx.user.id),
          eq(channels.type, input.type),
          eq(channels.accountId, input.accountId || "")
        )
      );
      
      if (existing.length > 0) {
        throw new Error(`Canal ${input.type} com esta conta já está conectado`);
      }
      
      const result = await db.insert(channels).values({
        userId: ctx.user.id,
        type: input.type,
        name: input.name,
        accountId: input.accountId || null,
        accessToken: input.accessToken || null,
        status: "connected",
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

  cleanupDuplicates: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    
    const userChannels = await db.select().from(channels).where(eq(channels.userId, ctx.user.id));
    const seen = new Map<string, number[]>();
    
    for (const ch of userChannels) {
      const key = `${ch.type}-${ch.accountId || ch.name}`;
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(ch.id);
    }
    
    let deletedCount = 0;
    for (const [, ids] of seen) {
      if (ids.length > 1) {
        const idsToDelete = ids.slice(1);
        for (const id of idsToDelete) {
          await db.delete(channels).where(eq(channels.id, id));
          deletedCount++;
        }
      }
    }
    
    return { deletedCount, message: `${deletedCount} canais duplicados removidos` };
  }),
});
