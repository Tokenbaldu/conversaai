import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { mediaFiles } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "../storage";

export const mediaRouter = router({
  list: protectedProcedure
    .input(z.object({ type: z.enum(["image", "video", "audio", "document"]).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(mediaFiles.userId, ctx.user.id)];
      if (input?.type) conditions.push(eq(mediaFiles.type, input.type));
      return db.select().from(mediaFiles).where(and(...conditions)).orderBy(desc(mediaFiles.createdAt));
    }),

  upload: protectedProcedure
    .input(z.object({
      filename: z.string(),
      originalName: z.string(),
      mimeType: z.string(),
      size: z.number(),
      base64Data: z.string(),
      type: z.enum(["image", "video", "audio", "document"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Decode base64 and upload to storage
      const buffer = Buffer.from(input.base64Data, "base64");
      const storageKey = `media/${ctx.user.id}/${Date.now()}-${input.filename}`;
      const { key, url } = await storagePut(storageKey, buffer, input.mimeType);

      const result = await db.insert(mediaFiles).values({
        userId: ctx.user.id,
        filename: input.filename,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.size,
        storageKey: key,
        url: url,
        type: input.type,
      });

      return { id: (result as any)[0]?.insertId ?? 0, url, key };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(mediaFiles).where(and(eq(mediaFiles.id, input.id), eq(mediaFiles.userId, ctx.user.id)));
      return { success: true };
    }),
});
