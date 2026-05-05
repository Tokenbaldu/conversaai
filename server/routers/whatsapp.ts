import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  whatsappIntegrations,
  whatsappConnectionHistory,
  whatsappSyncedContacts,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import QRCode from "qrcode";
import {
  startWhatsAppSession,
  getSessionStatus,
  disconnectSession,
  getQRCode,
} from "../services/whatsapp-session";

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

export const whatsappRouter = router({
  // Start WhatsApp integration - generates real QR code
  startIntegration: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Start WhatsApp session with Baileys
      const { qrCode } = await startWhatsAppSession(sessionId);

      // Create pending integration in database
      const result = await db.insert(whatsappIntegrations).values({
        userId: ctx.user.id,
        phoneNumber: "",
        waId: `temp_${sessionId}`,
        accessToken: "",
        status: "pending",
        qrCode,
        sessionId,
        expiresAt,
      });

      // Log connection attempt
      await db.insert(whatsappConnectionHistory).values({
        whatsappIntegrationId: (result as any)[0]?.insertId ?? 0,
        userId: ctx.user.id,
        eventType: "scanned",
        metadata: { sessionId },
      });

      return {
        sessionId,
        qrCode,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      console.error("Error starting WhatsApp integration:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to start WhatsApp integration",
      });
    }
  }),

  // Check integration status
  checkStatus: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Check session status from Baileys
        const sessionStatus = getSessionStatus(input.sessionId);

        if (sessionStatus.status === "connected") {
          // Update database with connected status
          await db
            .update(whatsappIntegrations)
            .set({
              status: "active",
              phoneNumber: sessionStatus.phoneNumber || "",
              waId: sessionStatus.phoneNumber || "",
              accessToken: `token_${input.sessionId}`,
            })
            .where(eq(whatsappIntegrations.sessionId, input.sessionId));

          // Log connection success
          const integration = await db
            .select()
            .from(whatsappIntegrations)
            .where(eq(whatsappIntegrations.sessionId, input.sessionId))
            .limit(1);

          if (integration[0]) {
            await db.insert(whatsappConnectionHistory).values({
              whatsappIntegrationId: integration[0].id,
              userId: ctx.user.id,
              eventType: "connected",
              phoneNumber: sessionStatus.phoneNumber,
            });
          }

          return {
            status: "active",
            phoneNumber: sessionStatus.phoneNumber || "",
            waId: sessionStatus.phoneNumber || "",
          };
        }

        // Check database for status
        const integration = await db
          .select()
          .from(whatsappIntegrations)
          .where(eq(whatsappIntegrations.sessionId, input.sessionId))
          .limit(1);

        if (!integration[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Integration session not found",
          });
        }

        return {
          status: integration[0].status,
          phoneNumber: integration[0].phoneNumber || "",
          waId: integration[0].waId || "",
        };
      } catch (error) {
        console.error("Error checking WhatsApp status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check integration status",
        });
      }
    }),

  // Get user's WhatsApp integrations
  getIntegrations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const integrations = await db
        .select()
        .from(whatsappIntegrations)
        .where(eq(whatsappIntegrations.userId, ctx.user.id));

      return integrations.map((i) => ({
        id: i.id,
        phoneNumber: i.phoneNumber,
        waId: i.waId,
        status: i.status,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching WhatsApp integrations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch integrations",
      });
    }
  }),

  // Disconnect WhatsApp integration
  disconnect: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Verify ownership
        const integration = await db
          .select()
          .from(whatsappIntegrations)
          .where(eq(whatsappIntegrations.id, input.integrationId))
          .limit(1);

        if (!integration[0] || integration[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to disconnect this integration",
          });
        }

        // Disconnect session
        if (integration[0].sessionId) {
          disconnectSession(integration[0].sessionId);
        }

        // Log disconnection event
        await db.insert(whatsappConnectionHistory).values({
          whatsappIntegrationId: input.integrationId,
          userId: ctx.user.id,
          eventType: "disconnected",
          phoneNumber: integration[0].phoneNumber || undefined,
        });

        // Update status to disconnected
        await db
          .update(whatsappIntegrations)
          .set({ status: "disconnected" })
          .where(eq(whatsappIntegrations.id, input.integrationId));

        return { success: true };
      } catch (error) {
        console.error("Error disconnecting WhatsApp:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disconnect integration",
        });
      }
    }),

  // Get connection history
  getConnectionHistory: protectedProcedure
    .input(z.object({ integrationId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        let query;
        if (input.integrationId) {
          query = db
            .select()
            .from(whatsappConnectionHistory)
            .where(
              and(
                eq(whatsappConnectionHistory.userId, ctx.user.id),
                eq(
                  whatsappConnectionHistory.whatsappIntegrationId,
                  input.integrationId
                )
              )
            );
        } else {
          query = db
            .select()
            .from(whatsappConnectionHistory)
            .where(eq(whatsappConnectionHistory.userId, ctx.user.id));
        }

        const history = await query;
        return history.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      } catch (error) {
        console.error("Error fetching connection history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch connection history",
        });
      }
    }),

  // Sync contacts from WhatsApp
  syncContacts: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Verify ownership
        const integration = await db
          .select()
          .from(whatsappIntegrations)
          .where(
            and(
              eq(whatsappIntegrations.id, input.integrationId),
              eq(whatsappIntegrations.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!integration[0]) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to sync contacts for this integration",
          });
        }

        // Simulate syncing contacts (in real implementation, fetch from WhatsApp API)
        const syncedCount = 0; // Placeholder

        return {
          success: true,
          syncedCount,
          message: `Sincronizados ${syncedCount} contatos do WhatsApp`,
        };
      } catch (error) {
        console.error("Error syncing contacts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync contacts",
        });
      }
    }),

  // Get synced contacts
  getSyncedContacts: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const syncedContacts = await db
          .select()
          .from(whatsappSyncedContacts)
          .where(
            and(
              eq(whatsappSyncedContacts.userId, ctx.user.id),
              eq(
                whatsappSyncedContacts.whatsappIntegrationId,
                input.integrationId
              )
            )
          );

        return syncedContacts;
      } catch (error) {
        console.error("Error fetching synced contacts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch synced contacts",
        });
      }
    }),
});
