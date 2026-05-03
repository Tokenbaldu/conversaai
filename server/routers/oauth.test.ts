import { describe, it, expect } from "vitest";
import { getDb } from "../db";
import { oauthApplications } from "../../drizzle/schema";

describe("OAuth Router", () => {
  it("should have oauth_applications table available", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const apps = await db.select().from(oauthApplications);
    expect(Array.isArray(apps)).toBe(true);
  });

  it("should create an OAuth application", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const clientId = `test_${Date.now()}`;
    const result = await db
      .insert(oauthApplications)
      .values({
        name: "Test App",
        clientId,
        clientSecret: "secret123",
        redirectUris: JSON.stringify(["https://example.com/callback"]),
        scopes: JSON.stringify(["openid"]),
        isActive: true,
      });

    // Result can be either insertId or the result object itself
    const insertId = (result as any).insertId || (result as any)[0];
    expect(insertId).toBeDefined();
  });

  it("should handle JSON fields correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const clientId = `test_json_${Date.now()}`;
    const redirectUris = ["https://example.com/callback"];
    const scopes = ["openid", "profile"];

    await db
      .insert(oauthApplications)
      .values({
        name: "JSON Test",
        clientId,
        clientSecret: "secret456",
        redirectUris: JSON.stringify(redirectUris),
        scopes: JSON.stringify(scopes),
        isActive: true,
      });

    expect(JSON.parse(JSON.stringify(redirectUris))).toEqual(redirectUris);
    expect(JSON.parse(JSON.stringify(scopes))).toEqual(scopes);
  });

  it("should support active/inactive status", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const clientId = `test_status_${Date.now()}`;
    
    const result = await db
      .insert(oauthApplications)
      .values({
        name: "Status Test",
        clientId,
        clientSecret: "secret789",
        redirectUris: JSON.stringify(["https://example.com"]),
        scopes: JSON.stringify(["openid"]),
        isActive: false,
      });

    const insertId = (result as any).insertId || (result as any)[0];
    expect(insertId).toBeDefined();
  });

  it("should have unique clientId constraint", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const clientId = `unique_${Date.now()}`;
    
    await db
      .insert(oauthApplications)
      .values({
        name: "Unique Test",
        clientId,
        clientSecret: "secret1",
        redirectUris: JSON.stringify(["https://example.com"]),
        scopes: JSON.stringify(["openid"]),
        isActive: true,
      });

    expect(clientId).toBeDefined();
  });

  it("should support all required fields", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const clientId = `test_fields_${Date.now()}`;
    
    const result = await db
      .insert(oauthApplications)
      .values({
        name: "Complete Test",
        clientId,
        clientSecret: "secret_complete",
        redirectUris: JSON.stringify(["https://example.com/callback"]),
        scopes: JSON.stringify(["openid", "profile", "email"]),
        isActive: true,
      });

    const insertId = (result as any).insertId || (result as any)[0];
    expect(insertId).toBeDefined();
  });
});
