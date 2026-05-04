import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const settingsRouter = router({
  // Get all settings (public)
  getAll: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const settings = await db.select().from(siteSettings);
      const result: Record<string, string> = {};

      settings.forEach((setting) => {
        result[setting.key] = setting.value;
      });

      return result;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch settings",
      });
    }
  }),

  // Get specific setting (public)
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const setting = await db
          .select()
          .from(siteSettings)
          .where(eq(siteSettings.key, input.key))
          .limit(1);

        return setting[0]?.value || null;
      } catch (error) {
        console.error("Error fetching setting:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch setting",
        });
      }
    }),

  // Update setting (admin only)
  update: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Check if setting exists
        const existing = await db
          .select()
          .from(siteSettings)
          .where(eq(siteSettings.key, input.key))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await db
            .update(siteSettings)
            .set({
              value: input.value,
              description: input.description,
            })
            .where(eq(siteSettings.key, input.key));
        } else {
          // Insert new
          await db.insert(siteSettings).values({
            key: input.key,
            value: input.value,
            description: input.description,
          });
        }

        return { success: true, key: input.key, value: input.value };
      } catch (error) {
        console.error("Error updating setting:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update setting",
        });
      }
    }),

  // Delete setting (admin only)
  delete: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        await db
          .delete(siteSettings)
          .where(eq(siteSettings.key, input.key));

        return { success: true };
      } catch (error) {
        console.error("Error deleting setting:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete setting",
        });
      }
    }),
});
