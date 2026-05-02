import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { channels } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const oauthRouter = router({
  /**
   * Inicia o fluxo OAuth para um canal específico
   * Retorna a URL de autenticação
   */
  getAuthUrl: protectedProcedure
    .input(
      z.object({
        channelType: z.enum(["whatsapp", "instagram", "messenger"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL || "https://api.manus.im";
      const redirectUri = `${process.env.VITE_APP_ID || "conversaai"}/oauth/callback`;

      const authUrls: Record<string, string> = {
        whatsapp: `https://www.whatsapp.com/business/downloads/WhatsAppBusinessAPI_Quickstart.pdf?redirect=${redirectUri}`,
        instagram: `https://instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID || "YOUR_INSTAGRAM_CLIENT_ID"}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_graph_user_media&response_type=code`,
        messenger: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID"}&redirect_uri=${redirectUri}&scope=pages_manage_messaging,pages_read_engagement`,
      };

      return {
        url: authUrls[input.channelType],
        channelType: input.channelType,
      };
    }),

  /**
   * Processa o callback OAuth e salva o token
   */
  handleCallback: protectedProcedure
    .input(
      z.object({
        channelType: z.enum(["whatsapp", "instagram", "messenger"]),
        code: z.string(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Aqui você trocaria o code por um access token
        // Este é um exemplo simplificado
        const accessToken = `token_${input.channelType}_${Date.now()}`;
        const accountId = `account_${input.channelType}_${Math.random().toString(36).substr(2, 9)}`;

        const result = await db
          .insert(channels)
          .values({
            userId: ctx.user.id,
            type: input.channelType,
            name: `${input.channelType.charAt(0).toUpperCase() + input.channelType.slice(1)} Account`,
            accountId,
            accessToken,
            status: "connected",
            config: {
              connectedAt: new Date().toISOString(),
              scope: input.channelType === "whatsapp" ? ["messages", "message_status"] : [],
            },
          });

        return {
          success: true,
          channelId: (result as any)[0]?.insertId ?? 0,
          channelType: input.channelType,
        };
      } catch (error) {
        console.error("[OAuth] Callback failed:", error);
        throw new Error("Failed to process OAuth callback");
      }
    }),

  /**
   * Testa a conexão com um canal
   */
  testConnection: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const channel = await db
        .select()
        .from(channels)
        .where(eq(channels.id, input.channelId))
        .limit(1);

      if (!channel.length || channel[0].userId !== ctx.user.id) {
        throw new Error("Channel not found or unauthorized");
      }

      const ch = channel[0];

      // Simular teste de conexão
      const isConnected = ch.status === "connected" && !!ch.accessToken;

      return {
        success: isConnected,
        status: ch.status,
        channelType: ch.type,
        message: isConnected
          ? `${ch.type} conectado com sucesso`
          : `Falha ao conectar ${ch.type}`,
      };
    }),

  /**
   * Desconecta um canal
   */
  disconnect: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const channel = await db
        .select()
        .from(channels)
        .where(eq(channels.id, input.channelId))
        .limit(1);

      if (!channel.length || channel[0].userId !== ctx.user.id) {
        throw new Error("Channel not found or unauthorized");
      }

      await db
        .update(channels)
        .set({
          status: "disconnected",
          accessToken: null,
          updatedAt: new Date(),
        })
        .where(eq(channels.id, input.channelId));

      return {
        success: true,
        message: `${channel[0].type} desconectado com sucesso`,
      };
    }),

  /**
   * Obtém informações de um canal conectado
   */
  getChannelInfo: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const channel = await db
        .select()
        .from(channels)
        .where(eq(channels.id, input.channelId))
        .limit(1);

      if (!channel.length || channel[0].userId !== ctx.user.id) {
        throw new Error("Channel not found or unauthorized");
      }

      const ch = channel[0];

      return {
        id: ch.id,
        type: ch.type,
        name: ch.name,
        status: ch.status,
        accountId: ch.accountId,
        connectedAt: ch.createdAt,
        config: ch.config,
      };
    }),
});
