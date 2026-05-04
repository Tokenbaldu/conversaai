import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { whatsappIntegrations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Mock QR code generation - in production, use a real library
function generateMockQRCode(): string {
  // Return a base64 encoded placeholder QR code
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const whatsappRouter = router({
  // Start WhatsApp integration - generates QR code
  startIntegration: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const sessionId = generateSessionId();
      const qrCode = generateMockQRCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Create pending integration
      const result = await db.insert(whatsappIntegrations).values({
        userId: ctx.user.id,
        phoneNumber: "",
        waId: "",
        accessToken: "",
        status: "pending",
        qrCode,
        sessionId,
        expiresAt,
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
          phoneNumber: integration[0].phoneNumber,
          waId: integration[0].waId,
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
});
