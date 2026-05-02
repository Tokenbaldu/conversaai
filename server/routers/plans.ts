import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { plans, userPlans } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";

export const plansRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(plans);
  }),

  current: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const [up] = await db
      .select({ userPlan: userPlans, plan: plans })
      .from(userPlans)
      .innerJoin(plans, eq(userPlans.planId, plans.id))
      .where(and(eq(userPlans.userId, ctx.user.id), eq(userPlans.status, "active")))
      .limit(1);
    return up ?? null;
  }),

  subscribe: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Cancel existing plan
      await db.update(userPlans).set({ status: "cancelled" } as any).where(and(eq(userPlans.userId, ctx.user.id), eq(userPlans.status, "active")));

      // Subscribe to new plan
      const [plan] = await db.select().from(plans).where(eq(plans.id, input.planId)).limit(1);
      await db.insert(userPlans).values({
        userId: ctx.user.id,
        planId: input.planId,
        status: "active",
      });

      if (plan) {
        await notifyOwner({
          title: "Novo plano contratado",
          content: `Usuário ${ctx.user.name || ctx.user.email} assinou o plano ${plan.name}.`,
        });
      }

      return { success: true };
    }),
});
