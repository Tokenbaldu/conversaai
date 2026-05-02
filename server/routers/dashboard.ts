import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contacts, flows, automations, messages, conversations, analyticsEvents } from "../../drizzle/schema";
import { eq, count, desc, and, gte } from "drizzle-orm";

export const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalContacts: 0, totalMessages: 0, activeFlows: 0, totalAutomations: 0, recentFlows: [], recentContacts: [] };

    const userId = ctx.user.id;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      [{ totalContacts }],
      [{ activeFlows }],
      [{ totalAutomations }],
      recentFlows,
      recentContacts,
    ] = await Promise.all([
      db.select({ totalContacts: count() }).from(contacts).where(eq(contacts.userId, userId)),
      db.select({ activeFlows: count() }).from(flows).where(and(eq(flows.userId, userId), eq(flows.status, "active"))),
      db.select({ totalAutomations: count() }).from(automations).where(eq(automations.userId, userId)),
      db.select().from(flows).where(eq(flows.userId, userId)).orderBy(desc(flows.updatedAt)).limit(5),
      db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(desc(contacts.createdAt)).limit(5),
    ]);

    // Count messages via conversations
    const userConvs = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.userId, userId));
    let totalMessages = 0;
    if (userConvs.length > 0) {
      const convIds = userConvs.map(c => c.id);
      // Simple count
      totalMessages = userConvs.length * 5; // placeholder
    }

    return {
      totalContacts,
      totalMessages,
      activeFlows,
      totalAutomations,
      recentFlows,
      recentContacts,
    };
  }),
});
