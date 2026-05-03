import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { oauthApplications } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("OAuth Router", () => {
  let testAppId: number;
  let testClientId: string;

  beforeAll(async () => {
    // Setup: Create a test OAuth application
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .insert(oauthApplications)
      .values({
        name: "Test OAuth App",
        clientId: "test_client_id_123",
        clientSecret: "test_client_secret_456",
        redirectUris: ["https://example.com/callback"],
        scopes: ["openid", "profile", "email"],
        isActive: true,
      });

    testAppId = (result as any).insertId;
    testClientId = "test_client_id_123";
  });

  afterAll(async () => {
    // Cleanup: Delete the test OAuth application
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(oauthApplications)
      .where(eq(oauthApplications.id, testAppId));
  });

  it("should create an OAuth application with valid data", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .insert(oauthApplications)
      .values({
        name: "New OAuth App",
        clientId: `test_client_${Date.now()}`,
        clientSecret: "new_secret_789",
        redirectUris: ["https://newapp.com/callback"],
        scopes: ["openid"],
        isActive: true,
      });

    expect((result as any).insertId).toBeDefined();
  });

  it("should retrieve an OAuth application by ID", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const apps = await db
      .select()
      .from(oauthApplications)
      .where(eq(oauthApplications.id, testAppId));

    expect(apps.length).toBe(1);
    expect(apps[0].name).toBe("Test OAuth App");
    expect(apps[0].clientId).toBe(testClientId);
  });

  it("should list all OAuth applications", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const apps = await db.select().from(oauthApplications);

    expect(apps.length).toBeGreaterThan(0);
    expect(apps.some((app) => app.id === testAppId)).toBe(true);
  });

  it("should update an OAuth application", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(oauthApplications)
      .set({ name: "Updated OAuth App" })
      .where(eq(oauthApplications.id, testAppId));

    const apps = await db
      .select()
      .from(oauthApplications)
      .where(eq(oauthApplications.id, testAppId));

    expect(apps[0].name).toBe("Updated OAuth App");
  });

  it("should validate OAuth credentials correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const apps = await db
      .select()
      .from(oauthApplications)
      .where(eq(oauthApplications.clientId, testClientId));

    const app = apps[0];

    // Valid credentials
    expect(app.clientSecret).toBe("test_client_secret_456");
    expect(app.isActive).toBe(true);

    // Invalid credentials should not match
    expect(app.clientSecret).not.toBe("wrong_secret");
  });

  it("should deactivate an OAuth application", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(oauthApplications)
      .set({ isActive: false })
      .where(eq(oauthApplications.id, testAppId));

    const apps = await db
      .select()
      .from(oauthApplications)
      .where(eq(oauthApplications.id, testAppId));

    expect(apps[0].isActive).toBe(false);

    // Reactivate for cleanup
    await db
      .update(oauthApplications)
      .set({ isActive: true })
      .where(eq(oauthApplications.id, testAppId));
  });

  it("should handle redirect URIs as JSON array", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const apps = await db
      .select()
      .from(oauthApplications)
      .where(eq(oauthApplications.id, testAppId));

    const app = apps[0];
    expect(Array.isArray(app.redirectUris)).toBe(true);
    expect(app.redirectUris).toContain("https://example.com/callback");
  });

  it("should handle scopes as JSON array", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const apps = await db
      .select()
      .from(oauthApplications)
      .where(eq(oauthApplications.id, testAppId));

    const app = apps[0];
    expect(Array.isArray(app.scopes)).toBe(true);
    expect(app.scopes).toContain("openid");
    expect(app.scopes).toContain("profile");
    expect(app.scopes).toContain("email");
  });
});
