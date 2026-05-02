import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";

describe("Admin Access Control", () => {
  // Contexto de usuário não-admin
  const nonAdminContext = {
    user: {
      id: 2,
      email: "user@example.com",
      name: "Regular User",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {
      headers: {
        origin: "http://localhost:3000",
      },
    } as any,
  };

  // Contexto de usuário admin
  const adminContext = {
    user: {
      id: 1,
      email: "admin@example.com",
      name: "Admin User",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {
      headers: {
        origin: "http://localhost:3000",
      },
    } as any,
  };

  it("should deny non-admin access to getDashboardStats", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.getDashboardStats();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("administrador");
    }
  });

  it("should deny non-admin access to listUsers", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.listUsers({ limit: 50, offset: 0 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to listPlans", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.listPlans();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to getStripeSettings", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.getStripeSettings();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to getSiteSettings", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.getSiteSettings();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin access to getDashboardStats", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    const result = await caller.admin.getDashboardStats();
    expect(result).toBeDefined();
    expect(result.totalUsers).toBeGreaterThanOrEqual(0);
    expect(result.activeSubscriptions).toBeGreaterThanOrEqual(0);
  });

  it("should allow admin access to listPlans", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    const result = await caller.admin.listPlans();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin access to getSiteSettings", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    const result = await caller.admin.getSiteSettings();
    expect(result).toBeDefined();
    expect(result.siteName).toBeDefined();
  });

  it("should deny non-admin access to updateUser", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.updateUser({
        userId: 2,
        role: "admin",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to deleteUser", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.deleteUser({ userId: 2 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to updatePlan", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.updatePlan({
        planId: 1,
        priceMonthly: 100,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to createPlan", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.createPlan({
        name: "Test Plan",
        priceMonthly: 100,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to deletePlan", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.deletePlan({ planId: 1 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to updateStripeSettings", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.updateStripeSettings({
        secretKey: "sk_test_123",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should deny non-admin access to updateSiteSettings", async () => {
    const caller = appRouter.createCaller(nonAdminContext);
    
    try {
      await caller.admin.updateSiteSettings({
        siteName: "New Name",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
