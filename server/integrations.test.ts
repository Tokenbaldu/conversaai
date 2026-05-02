import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-oauth",
    email: "test@integrations.com",
    name: "Test Integration User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("OAuth Integration Router", () => {
  describe("getAuthUrl", () => {
    it("returns WhatsApp auth URL for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauth.getAuthUrl({
        channelType: "whatsapp",
      });

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("channelType");
      expect(result.channelType).toBe("whatsapp");
      expect(result.url).toBeTruthy();
    });

    it("returns Instagram auth URL", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauth.getAuthUrl({
        channelType: "instagram",
      });

      expect(result.channelType).toBe("instagram");
      expect(result.url).toContain("instagram");
    });

    it("returns Messenger auth URL", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauth.getAuthUrl({
        channelType: "messenger",
      });

      expect(result.channelType).toBe("messenger");
      expect(result.url).toContain("facebook");
    });

    it("throws UNAUTHORIZED for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.getAuthUrl({
          channelType: "whatsapp",
        })
      ).rejects.toThrow();
    });
  });

  describe("handleCallback", () => {
    it("processes OAuth callback and creates channel", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauth.handleCallback({
        channelType: "whatsapp",
        code: "test_code_123",
        state: "test_state_456",
      });

      expect(result.success).toBe(true);
      expect(result.channelType).toBe("whatsapp");
      expect(typeof result.channelId).toBe("number");
    });

    it("creates Instagram channel on callback", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauth.handleCallback({
        channelType: "instagram",
        code: "test_instagram_code",
      });

      expect(result.success).toBe(true);
      expect(result.channelType).toBe("instagram");
      expect(typeof result.channelId).toBe("number");
    });

    it("throws UNAUTHORIZED for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.handleCallback({
          channelType: "whatsapp",
          code: "test_code",
        })
      ).rejects.toThrow();
    });
  });

  describe("testConnection", () => {
    it("tests connection to a channel", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First create a channel
      const createResult = await caller.oauth.handleCallback({
        channelType: "whatsapp",
        code: "test_code",
      });

      // Then test the connection
      const testResult = await caller.oauth.testConnection({
        channelId: createResult.channelId as number,
      });

      expect(testResult.success).toBe(true);
      expect(testResult.status).toBe("connected");
      expect(testResult.channelType).toBe("whatsapp");
    });

    it("throws error for non-existent channel", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.testConnection({
          channelId: 99999,
        })
      ).rejects.toThrow();
    });

    it("throws UNAUTHORIZED for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.testConnection({
          channelId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("disconnect", () => {
    it("disconnects a channel", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First create a channel
      const createResult = await caller.oauth.handleCallback({
        channelType: "whatsapp",
        code: "test_code",
      });

      // Then disconnect it
      const disconnectResult = await caller.oauth.disconnect({
        channelId: createResult.channelId as number,
      });

      expect(disconnectResult.success).toBe(true);
      expect(disconnectResult.message).toContain("desconectado");
    });

    it("throws error for non-existent channel", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.disconnect({
          channelId: 99999,
        })
      ).rejects.toThrow();
    });

    it("throws UNAUTHORIZED for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.disconnect({
          channelId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("getChannelInfo", () => {
    it("retrieves channel information", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First create a channel
      const createResult = await caller.oauth.handleCallback({
        channelType: "instagram",
        code: "test_code",
      });

      // Then get its info
      const infoResult = await caller.oauth.getChannelInfo({
        channelId: createResult.channelId as number,
      });

      expect(infoResult.type).toBe("instagram");
      expect(infoResult.status).toBe("connected");
      expect(infoResult).toHaveProperty("accountId");
      expect(infoResult).toHaveProperty("connectedAt");
    });

    it("throws error for non-existent channel", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.getChannelInfo({
          channelId: 99999,
        })
      ).rejects.toThrow();
    });

    it("throws UNAUTHORIZED for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.oauth.getChannelInfo({
          channelId: 1,
        })
      ).rejects.toThrow();
    });
  });
});

  describe("Channels Integration", () => {
    it("lists all channels for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.channels.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("creates a channel via channels router", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.channels.create({
        type: "whatsapp",
        name: "My WhatsApp Business",
        accessToken: "test_token_123",
        accountId: "1234567890",
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
    });

    it("throws UNAUTHORIZED when creating channel without auth", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.channels.create({
          type: "whatsapp",
          name: "Test",
        })
      ).rejects.toThrow();
    });
});
