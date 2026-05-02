import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { flows } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { z } from "zod";

export const flowsRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(flows.userId, ctx.user.id)];
      if (input?.status) conditions.push(eq(flows.status, input.status as any));
      return db.select().from(flows).where(and(...conditions)).orderBy(desc(flows.updatedAt));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const [flow] = await db.select().from(flows).where(and(eq(flows.id, input.id), eq(flows.userId, ctx.user.id))).limit(1);
      return flow ?? null;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      triggerType: z.enum(["keyword", "event", "schedule", "manual", "webhook"]).default("manual"),
      triggerConfig: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const defaultNodes = [
        { id: "start", type: "startNode", position: { x: 250, y: 50 }, data: { label: "Início" } },
      ];
      const result = await db.insert(flows).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        triggerType: input.triggerType,
        triggerConfig: input.triggerConfig || null,
        nodes: defaultNodes,
        edges: [],
        status: "draft",
      });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      nodes: z.any().optional(),
      edges: z.any().optional(),
      status: z.enum(["draft", "active", "paused", "archived"]).optional(),
      triggerType: z.enum(["keyword", "event", "schedule", "manual", "webhook"]).optional(),
      triggerConfig: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...data } = input;
      await db.update(flows).set(data as any).where(and(eq(flows.id, id), eq(flows.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(flows).where(and(eq(flows.id, input.id), eq(flows.userId, ctx.user.id)));
      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [original] = await db.select().from(flows).where(and(eq(flows.id, input.id), eq(flows.userId, ctx.user.id))).limit(1);
      if (!original) throw new Error("Flow not found");
      const result = await db.insert(flows).values({
        ...original,
        id: undefined as any,
        name: `${original.name} (cópia)`,
        status: "draft",
      });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),
});
