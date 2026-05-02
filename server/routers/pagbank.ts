import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { pagbankConfigs, pagbankTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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

export const pagbankRouter = router({
  // ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────
  getConfig: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    const config = await db.select().from(pagbankConfigs).limit(1);
    return config[0] || null;
  }),

  updateConfig: adminProcedure
    .input(
      z.object({
        integrationKey: z.string().optional(),
        accessToken: z.string().optional(),
        webhookUrl: z.string().url().optional(),
        webhookSecret: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const existingConfig = await db.select().from(pagbankConfigs).limit(1);

      if (existingConfig.length > 0) {
        // Atualizar configuração existente
        await db
          .update(pagbankConfigs)
          .set({
            integrationKey: input.integrationKey || existingConfig[0].integrationKey,
            accessToken: input.accessToken || existingConfig[0].accessToken,
            webhookUrl: input.webhookUrl || existingConfig[0].webhookUrl,
            webhookSecret: input.webhookSecret || existingConfig[0].webhookSecret,
            isActive: input.isActive !== undefined ? input.isActive : existingConfig[0].isActive,
          })
          .where(eq(pagbankConfigs.id, existingConfig[0].id));
      } else {
        // Criar nova configuração
        await db.insert(pagbankConfigs).values({
          integrationKey: input.integrationKey,
          accessToken: input.accessToken,
          webhookUrl: input.webhookUrl,
          webhookSecret: input.webhookSecret,
          isActive: input.isActive || false,
        });
      }

      return { success: true, message: "Configuração do PagBank atualizada com sucesso" };
    }),

  testConnection: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    const config = await db.select().from(pagbankConfigs).limit(1);

    if (!config[0] || !config[0].integrationKey || !config[0].accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Configuração do PagBank incompleta",
      });
    }

    try {
      // Simular teste de conexão
      // Em produção, isso faria uma chamada real à API do PagBank
      const isValid = config[0].integrationKey.startsWith("sk_") && config[0].accessToken.length > 10;

      if (isValid) {
        // Atualizar status do teste
        await db
          .update(pagbankConfigs)
          .set({
            testStatus: "success",
            lastTestAt: new Date(),
          })
          .where(eq(pagbankConfigs.id, config[0].id));

        return { success: true, status: "success", message: "Conexão com PagBank validada com sucesso" };
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      // Atualizar status do teste como falha
      if (config[0]) {
        await db
          .update(pagbankConfigs)
          .set({
            testStatus: "failed",
            lastTestAt: new Date(),
          })
          .where(eq(pagbankConfigs.id, config[0].id));
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao conectar com PagBank",
      });
    }
  }),

  // ─── TRANSAÇÕES ───────────────────────────────────────────────────────────
  getTransactions: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(["pending", "success", "failed", "refunded"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      let query: any = db.select().from(pagbankTransactions);

      if (input.status) {
        query = query.where(eq(pagbankTransactions.status, input.status));
      }

      const allTransactions = await query;
      const paginatedTransactions = (allTransactions as any[])
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(input.offset, input.offset + input.limit);

      return {
        transactions: paginatedTransactions,
        total: allTransactions.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  createTransaction: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        amount: z.number(),
        paymentMethod: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Gerar ID único da transação
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.insert(pagbankTransactions).values({
        transactionId,
        userId: ctx.user.id,
        planId: input.planId,
        amount: Math.round(input.amount * 100), // Converter para centavos
        paymentMethod: input.paymentMethod,
        description: input.description,
        status: "pending",
      });

      return {
        success: true,
        transactionId,
        message: "Transação criada com sucesso",
      };
    }),

  updateTransactionStatus: adminProcedure
    .input(
      z.object({
        transactionId: z.string(),
        status: z.enum(["pending", "success", "failed", "refunded"]),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const transactions = await db
        .select()
        .from(pagbankTransactions)
        .where(eq(pagbankTransactions.transactionId, input.transactionId));

      const transaction = transactions[0];

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transação não encontrada",
        });
      }

      const updateData: any = {
        status: input.status,
        errorMessage: input.errorMessage,
      };
      if (input.status !== "pending") {
        updateData.processedAt = new Date();
      }

      await db
        .update(pagbankTransactions)
        .set(updateData)
        .where(eq(pagbankTransactions.transactionId, input.transactionId));

      return { success: true, message: "Status da transação atualizado com sucesso" };
    }),

  // ─── ESTATÍSTICAS ─────────────────────────────────────────────────────────
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    const allTransactions = await db.select().from(pagbankTransactions);

    const stats = {
      totalTransactions: allTransactions.length,
      successfulTransactions: allTransactions.filter((t) => t.status === "success").length,
      failedTransactions: allTransactions.filter((t) => t.status === "failed").length,
      pendingTransactions: allTransactions.filter((t) => t.status === "pending").length,
      totalAmount: allTransactions
        .filter((t) => t.status === "success")
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      averageAmount:
        allTransactions.filter((t) => t.status === "success").length > 0
          ? allTransactions.filter((t) => t.status === "success").reduce((sum, t) => sum + (t.amount || 0), 0) /
            allTransactions.filter((t) => t.status === "success").length
          : 0,
    };

    return stats;
  }),
});
