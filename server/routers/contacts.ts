import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contacts, tags, contactTags } from "../../drizzle/schema";
import { eq, and, desc, like, inArray, count } from "drizzle-orm";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";

export const contactsRouter = router({
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["active", "inactive", "blocked"]).optional(),
      tagIds: z.array(z.number()).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };

      const conditions = [eq(contacts.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(contacts.status, input.status));
      if (input.search) conditions.push(like(contacts.name, `%${input.search}%`));

      const offset = (input.page - 1) * input.limit;
      const [items, [{ total }]] = await Promise.all([
        db.select().from(contacts).where(and(...conditions)).orderBy(desc(contacts.createdAt)).limit(input.limit).offset(offset),
        db.select({ total: count() }).from(contacts).where(and(...conditions)),
      ]);

      // Fetch tags for each contact
      const contactIds = items.map(c => c.id);
      let contactTagsData: any[] = [];
      if (contactIds.length > 0) {
        contactTagsData = await db
          .select({ contactId: contactTags.contactId, tag: tags })
          .from(contactTags)
          .innerJoin(tags, eq(contactTags.tagId, tags.id))
          .where(inArray(contactTags.contactId, contactIds));
      }

      const tagsByContact: Record<number, any[]> = {};
      contactTagsData.forEach(ct => {
        if (!tagsByContact[ct.contactId]) tagsByContact[ct.contactId] = [];
        tagsByContact[ct.contactId].push(ct.tag);
      });

      return {
        items: items.map(c => ({ ...c, tags: tagsByContact[c.id] || [] })),
        total,
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const [contact] = await db.select().from(contacts).where(and(eq(contacts.id, input.id), eq(contacts.userId, ctx.user.id))).limit(1);
      if (!contact) return null;

      const ctags = await db
        .select({ tag: tags })
        .from(contactTags)
        .innerJoin(tags, eq(contactTags.tagId, tags.id))
        .where(eq(contactTags.contactId, contact.id));

      return { ...contact, tags: ctags.map(ct => ct.tag) };
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      channel: z.enum(["whatsapp", "instagram", "messenger", "web"]).optional(),
      notes: z.string().optional(),
      customFields: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(contacts).values({
        userId: ctx.user.id,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        channel: input.channel || "web",
        notes: input.notes || null,
        customFields: input.customFields || null,
      });
      await notifyOwner({ title: "Novo contato criado", content: `${input.name} foi adicionado como contato.` });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "inactive", "blocked"]).optional(),
      customFields: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...data } = input;
      await db.update(contacts).set(data as any).where(and(eq(contacts.id, id), eq(contacts.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(contacts).where(and(eq(contacts.id, input.id), eq(contacts.userId, ctx.user.id)));
      return { success: true };
    }),

  addTag: protectedProcedure
    .input(z.object({ contactId: z.number(), tagId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(contactTags).values({ contactId: input.contactId, tagId: input.tagId });
      return { success: true };
    }),

  removeTag: protectedProcedure
    .input(z.object({ contactId: z.number(), tagId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(contactTags).where(and(eq(contactTags.contactId, input.contactId), eq(contactTags.tagId, input.tagId)));
      return { success: true };
    }),

  // Tags management
  listTags: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(tags).where(eq(tags.userId, ctx.user.id)).orderBy(tags.name);
  }),

  createTag: protectedProcedure
    .input(z.object({ name: z.string().min(1), color: z.string().default("#6366f1") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(tags).values({ userId: ctx.user.id, name: input.name, color: input.color });
      return { id: (result as any)[0]?.insertId ?? 0 };
    }),

  deleteTag: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(tags).where(and(eq(tags.id, input.id), eq(tags.userId, ctx.user.id)));
      return { success: true };
    }),
});
