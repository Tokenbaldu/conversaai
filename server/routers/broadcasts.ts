import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { broadcasts, contacts, contactTags } from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";

export const broadcastsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(broadcasts).where(eq(broadcasts.userId, ctx.user.id)).orderBy(desc(broadcasts.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      message: z.string().min(1),
      channel: z.enum(["whatsapp", "instagram", "messenger", "all"]).default("all"),
      segmentTags: z.array(z.number()).optional(),
      scheduledAt: z.number().optional(),
      mediaUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(broadcasts).values({
        userId: ctx.user.id,
        name: input.name,
        message: input.message,
        channel: input.channel,
        segmentTags: input.segmentTags || null,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        mediaUrl: input.mediaUrl || null,
        status: input.scheduledAt ? "scheduled" : "draft",
      });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      message: z.string().optional(),
      status: z.enum(["draft", "scheduled", "sending", "sent", "failed"]).optional(),
      scheduledAt: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, scheduledAt, ...data } = input;
      await db.update(broadcasts).set({
        ...data,
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
      } as any).where(and(eq(broadcasts.id, id), eq(broadcasts.userId, ctx.user.id)));
      return { success: true };
    }),

  send: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [broadcast] = await db.select().from(broadcasts).where(and(eq(broadcasts.id, input.id), eq(broadcasts.userId, ctx.user.id))).limit(1);
      if (!broadcast) throw new Error("Broadcast not found");

      // Mark as sending
      await db.update(broadcasts).set({ status: "sending" } as any).where(eq(broadcasts.id, input.id));

      // Simulate send (in production would integrate with channel APIs)
      setTimeout(async () => {
        const db2 = await getDb();
        if (db2) {
          await db2.update(broadcasts).set({
            status: "sent",
            sentAt: new Date(),
            stats: { total: 0, sent: 0, delivered: 0, failed: 0 },
          } as any).where(eq(broadcasts.id, input.id));
        }
      }, 2000);

      await notifyOwner({ title: "Broadcast enviado", content: `O broadcast "${broadcast.name}" foi iniciado.` });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(broadcasts).where(and(eq(broadcasts.id, input.id), eq(broadcasts.userId, ctx.user.id)));
      return { success: true };
    }),
});
