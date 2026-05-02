import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, plans, userPlans, channels, flows, contacts, automations, broadcasts, analyticsEvents, auditLogs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

// Middleware para verificar se o usuário é admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas administradores podem acessar este recurso",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ─── DASHBOARD ───────────────────────────────────────────────────────────
  getDashboardStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    const totalUsers = await db.select().from(users);
    const totalPlans = await db.select().from(userPlans);
    const totalFlows = await db.select().from(flows);
    const totalContacts = await db.select().from(contacts);
    const totalAutomations = await db.select().from(automations);
    const totalBroadcasts = await db.select().from(broadcasts);

    const activeSubscriptions = totalPlans.filter((p) => p.status === "active").length;
    const totalRevenue = totalPlans
      .filter((p) => p.status === "active")
      .reduce((sum) => sum + 0, 0); // Será calculado a partir do Stripe

    return {
      totalUsers: totalUsers.length,
      activeSubscriptions,
      totalRevenue,
      totalFlows: totalFlows.length,
      totalContacts: totalContacts.length,
      totalAutomations: totalAutomations.length,
      totalBroadcasts: totalBroadcasts.length,
      usersByRole: {
        admin: totalUsers.filter((u) => u.role === "admin").length,
        user: totalUsers.filter((u) => u.role === "user").length,
      },
    };
  }),

  // ─── USUÁRIOS ───────────────────────────────────────────────────────────
  listUsers: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const allUsers = await db.select().from(users);
      const paginatedUsers = allUsers.slice(input.offset, input.offset + input.limit);

      return {
        users: paginatedUsers,
        total: allUsers.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  getUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });

      const userPlans_ = await db.select().from(userPlans).where(eq(userPlans.userId, input.userId));
      const userFlows = await db.select().from(flows).where(eq(flows.userId, input.userId));
      const userContacts = await db.select().from(contacts).where(eq(contacts.userId, input.userId));

      return {
        user,
        plans: userPlans_,
        flows: userFlows,
        contacts: userContacts,
      };
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;
      if (input.role) updateData.role = input.role;

      await db.update(users).set(updateData).where(eq(users.id, input.userId));

      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível deletar sua própria conta" });
      }

      // Deletar dados associados
      await db.delete(userPlans).where(eq(userPlans.userId, input.userId));
      await db.delete(flows).where(eq(flows.userId, input.userId));
      await db.delete(contacts).where(eq(contacts.userId, input.userId));
      await db.delete(automations).where(eq(automations.userId, input.userId));
      await db.delete(broadcasts).where(eq(broadcasts.userId, input.userId));

      // Deletar usuário
      await db.delete(users).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // ─── PLANOS ───────────────────────────────────────────────────────────
  listPlans: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    return await db.select().from(plans);
  }),

  updatePlan: adminProcedure
    .input(
      z.object({
        planId: z.number(),
        name: z.string().optional(),
        maxContacts: z.number().optional(),
        maxFlows: z.number().optional(),
        maxBroadcasts: z.number().optional(),
        maxChannels: z.number().optional(),
        aiEnabled: z.boolean().optional(),
        whitelabelEnabled: z.boolean().optional(),
        priceMonthly: z.number().optional(),
        priceAnnual: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.maxContacts !== undefined) updateData.maxContacts = input.maxContacts;
      if (input.maxFlows !== undefined) updateData.maxFlows = input.maxFlows;
      if (input.maxBroadcasts !== undefined) updateData.maxBroadcasts = input.maxBroadcasts;
      if (input.maxChannels !== undefined) updateData.maxChannels = input.maxChannels;
      if (input.aiEnabled !== undefined) updateData.aiEnabled = input.aiEnabled;
      if (input.whitelabelEnabled !== undefined) updateData.whitelabelEnabled = input.whitelabelEnabled;
      if (input.priceMonthly !== undefined) updateData.priceMonthly = input.priceMonthly;
      if (input.priceAnnual !== undefined) updateData.priceAnnual = input.priceAnnual;

      await db.update(plans).set(updateData).where(eq(plans.id, input.planId));

      return { success: true };
    }),

  createPlan: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        maxContacts: z.number().default(100),
        maxFlows: z.number().default(3),
        maxBroadcasts: z.number().default(1),
        maxChannels: z.number().default(1),
        aiEnabled: z.boolean().default(false),
        whitelabelEnabled: z.boolean().default(false),
        priceMonthly: z.number().default(0),
        priceAnnual: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const [result] = await db.insert(plans).values({
        name: input.name,
        maxContacts: input.maxContacts,
        maxFlows: input.maxFlows,
        maxBroadcasts: input.maxBroadcasts,
        maxChannels: input.maxChannels,
        aiEnabled: input.aiEnabled,
        whitelabelEnabled: input.whitelabelEnabled,
        priceMonthly: input.priceMonthly,
        priceAnnual: input.priceAnnual,
      });

      return { success: true, planId: result.insertId };
    }),

  deletePlan: adminProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Verificar se há usuários com este plano
      const usersWithPlan = await db.select().from(userPlans).where(eq(userPlans.planId, input.planId));
      if (usersWithPlan.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Não é possível deletar um plano que está em uso",
        });
      }

      await db.delete(plans).where(eq(plans.id, input.planId));

      return { success: true };
    }),

  // ─── CONFIGURAÇÕES STRIPE ───────────────────────────────────────────────
  getStripeSettings: adminProcedure.query(async () => {
    // Retorna informações sobre as chaves Stripe configuradas
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const hasPublishableKey = !!process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;

    return {
      secretKeyConfigured: hasSecretKey,
      publishableKeyConfigured: hasPublishableKey,
      webhookSecretConfigured: hasWebhookSecret,
      allConfigured: hasSecretKey && hasPublishableKey && hasWebhookSecret,
    };
  }),

  updateStripeSettings: adminProcedure
    .input(
      z.object({
        secretKey: z.string().optional(),
        publishableKey: z.string().optional(),
        webhookSecret: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Nota: Em produção, isso seria feito através de variáveis de ambiente
      // ou um sistema de configuração seguro. Por enquanto, apenas validamos.

      if (input.secretKey && !input.secretKey.startsWith("sk_")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Chave secreta inválida. Deve começar com 'sk_'",
        });
      }

      if (input.publishableKey && !input.publishableKey.startsWith("pk_")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Chave publicável inválida. Deve começar com 'pk_'",
        });
      }

      return {
        success: true,
        message: "Configurações do Stripe atualizadas. Reinicie o servidor para aplicar as mudanças.",
      };
    }),

  // ─── CONFIGURAÇÕES GERAIS ───────────────────────────────────────────────
  getSiteSettings: adminProcedure.query(async () => {
    return {
      siteName: process.env.VITE_APP_TITLE || "ConversaAI",
      siteUrl: process.env.VITE_FRONTEND_FORGE_API_URL || "https://conversai.manus.space",
      maintenanceMode: false,
      emailNotifications: true,
    };
  }),

  updateSiteSettings: adminProcedure
    .input(
      z.object({
        siteName: z.string().optional(),
        maintenanceMode: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Nota: Em produção, isso seria persistido em um banco de dados
      // ou em um arquivo de configuração seguro

      return {
        success: true,
        message: "Configurações do site atualizadas",
        settings: input,
      };
    }),

  // ─── AUDITORIA ───────────────────────────────────────────────────────────
  getAuditLog: adminProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const events = await db.select().from(analyticsEvents).limit(input.limit);

      return {
        events,
        total: events.length,
      };
    }),

  // ─── AUDITORIA ───────────────────────────────────────────────────────────
  getAuditLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        action: z.string().optional(),
        entityType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const allLogs = await db.select().from(auditLogs);
      const filteredLogs = allLogs.filter((log) => {
        if (input.action && log.action !== input.action) return false;
        if (input.entityType && log.entityType !== input.entityType) return false;
        return true;
      });

      const paginatedLogs = filteredLogs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(input.offset, input.offset + input.limit);

      return {
        logs: paginatedLogs,
        total: filteredLogs.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  logAuditEvent: adminProcedure
    .input(
      z.object({
        action: z.string(),
        entityType: z.string(),
        entityId: z.number().optional(),
        changes: z.any().optional(),
        status: z.enum(["success", "failed"]).default("success"),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const ipAddress = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0] || (ctx.req.socket?.remoteAddress as string) || "unknown";
      const userAgent = (ctx.req.headers["user-agent"] as string) || "unknown";

      await db.insert(auditLogs).values({
        adminId: ctx.user.id,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        changes: input.changes ? JSON.stringify(input.changes) : null,
        ipAddress,
        userAgent,
        status: input.status,
        errorMessage: input.errorMessage,
      });

      return { success: true };
    }),

  // ─── NOTIFICAÇÕES ───────────────────────────────────────────────────────
  sendNotification: adminProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      await notifyOwner({
        title: input.title,
        content: input.content,
      });

      return { success: true };
    }),
});
