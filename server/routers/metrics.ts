import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, userPlans } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const metricsRouter = router({
  public: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get user statistics
      const allUsers = await db.select().from(users);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      // Note: activeUsers calculation simplified for demo
      const activeUsers = allUsers;

      // Generate mock data for demonstration
      // In production, these would come from actual analytics tables
      const totalUsers = allUsers.length;
      const activeUsersCount = Math.floor(totalUsers * 0.65);
      const totalMessages = Math.floor(totalUsers * 15000 + Math.random() * 5000000);
      const totalLeads = Math.floor(totalUsers * 250);

      // Generate trend data for the last 30 days
      const messagesTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString("pt-BR"),
          count: Math.floor(totalMessages / 30 + Math.random() * 100000),
        };
      });

      // Channel distribution (mock data)
      const channelDistribution = [
        { name: "WhatsApp", value: 45 },
        { name: "Instagram", value: 30 },
        { name: "Messenger", value: 15 },
        { name: "Telegram", value: 10 },
      ];

      // Top countries (mock data)
      const topCountries = [
        { country: "Brasil", users: Math.floor(totalUsers * 0.7) },
        { country: "Portugal", users: Math.floor(totalUsers * 0.1) },
        { country: "México", users: Math.floor(totalUsers * 0.08) },
        { country: "Argentina", users: Math.floor(totalUsers * 0.07) },
        { country: "Outros", users: Math.floor(totalUsers * 0.05) },
      ];

      return {
        totalUsers,
        activeUsers: activeUsersCount,
        totalMessages,
        totalLeads,
        avgDeliveryRate: 98,
        conversionRate: 12,
        messagesTrend,
        channelDistribution,
        topCountries,
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
  }),

  dashboard: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get subscription statistics
      const activePlans = await db
        .select()
        .from(userPlans)
        .where(eq(userPlans.status, "active"));

      const planBreakdown = {
        starter: activePlans.filter((p) => p.planId === 1).length,
        pro: activePlans.filter((p) => p.planId === 2).length,
        agency: activePlans.filter((p) => p.planId === 3).length,
      };

      const mrr = (
        planBreakdown.starter * 10 +
        planBreakdown.pro * 97 +
        planBreakdown.agency * 120
      );

      return {
        totalSubscriptions: activePlans.length,
        planBreakdown,
        monthlyRecurringRevenue: mrr.toFixed(2),
        churnRate: 2.5,
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }),
});
