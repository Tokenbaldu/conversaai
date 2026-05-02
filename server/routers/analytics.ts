import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { analyticsEvents, contacts, messages, conversations, flows, broadcasts } from "../../drizzle/schema";
import { eq, and, desc, count, gte } from "drizzle-orm";
import { z } from "zod";

export const analyticsRouter = router({
  overview: protectedProcedure
    .input(z.object({ period: z.enum(["7d", "30d", "90d"]).default("30d") }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { contacts: 0, messages: 0, conversations: 0, flows: 0, broadcasts: 0 };

      const days = input.period === "7d" ? 7 : input.period === "30d" ? 30 : 90;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        [{ totalContacts }],
        [{ totalConversations }],
        [{ totalFlows }],
        [{ totalBroadcasts }],
      ] = await Promise.all([
        db.select({ totalContacts: count() }).from(contacts).where(and(eq(contacts.userId, ctx.user.id), gte(contacts.createdAt, since))),
        db.select({ totalConversations: count() }).from(conversations).where(and(eq(conversations.userId, ctx.user.id), gte(conversations.createdAt, since))),
        db.select({ totalFlows: count() }).from(flows).where(eq(flows.userId, ctx.user.id)),
        db.select({ totalBroadcasts: count() }).from(broadcasts).where(eq(broadcasts.userId, ctx.user.id)),
      ]);

      return {
        contacts: totalContacts,
        conversations: totalConversations,
        flows: totalFlows,
        broadcasts: totalBroadcasts,
        messages: totalConversations * 4, // estimate
      };
    }),

  flowPerformance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(flows).where(eq(flows.userId, ctx.user.id)).orderBy(desc(flows.updatedAt)).limit(10);
  }),
});
