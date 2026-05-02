import {
  bigint,
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Plans ───────────────────────────────────────────────────────────────────
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(), // Free, Pro, Agency
  maxContacts: int("maxContacts").notNull().default(100),
  maxFlows: int("maxFlows").notNull().default(3),
  maxBroadcasts: int("maxBroadcasts").notNull().default(1),
  maxChannels: int("maxChannels").notNull().default(1),
  aiEnabled: boolean("aiEnabled").notNull().default(false),
  whitelabelEnabled: boolean("whitelabelEnabled").notNull().default(false),
  priceMonthly: int("priceMonthly").notNull().default(0), // cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;

// ─── User Plans ───────────────────────────────────────────────────────────────
export const userPlans = mysqlTable("user_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPlan = typeof userPlans.$inferSelect;

// ─── Channels ─────────────────────────────────────────────────────────────────
export const channels = mysqlTable("channels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["whatsapp", "instagram", "messenger"]).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  accountId: varchar("accountId", { length: 256 }),
  accessToken: text("accessToken"),
  status: mysqlEnum("status", ["connected", "disconnected", "pending"]).default("pending").notNull(),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Channel = typeof channels.$inferSelect;

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 16 }).default("#6366f1").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "messenger", "web"]).default("web"),
  channelId: varchar("channelId", { length: 256 }),
  avatar: text("avatar"),
  customFields: json("customFields"),
  notes: text("notes"),
  status: mysqlEnum("status", ["active", "inactive", "blocked"]).default("active").notNull(),
  lastInteractionAt: timestamp("lastInteractionAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;

// ─── Contact Tags ─────────────────────────────────────────────────────────────
export const contactTags = mysqlTable("contact_tags", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactTag = typeof contactTags.$inferSelect;

// ─── Flows ────────────────────────────────────────────────────────────────────
export const flows = mysqlTable("flows", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft").notNull(),
  nodes: json("nodes"), // ReactFlow nodes JSON
  edges: json("edges"), // ReactFlow edges JSON
  triggerType: mysqlEnum("triggerType", ["keyword", "event", "schedule", "manual", "webhook"]).default("manual"),
  triggerConfig: json("triggerConfig"),
  stats: json("stats"), // { sent, opened, clicked, converted }
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flow = typeof flows.$inferSelect;

// ─── Flow Templates ───────────────────────────────────────────────────────────
export const flowTemplates = mysqlTable("flow_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(), // welcome, support, sales, etc.
  thumbnail: text("thumbnail"),
  nodes: json("nodes").notNull(),
  edges: json("edges").notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlowTemplate = typeof flowTemplates.$inferSelect;

// ─── Automations ──────────────────────────────────────────────────────────────
export const automations = mysqlTable("automations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  flowId: int("flowId"),
  name: varchar("name", { length: 128 }).notNull(),
  triggerType: mysqlEnum("triggerType", ["keyword", "event", "schedule", "new_contact", "tag_added"]).notNull(),
  triggerConfig: json("triggerConfig").notNull(), // { keywords: [], event: '', cron: '' }
  status: mysqlEnum("status", ["active", "paused", "draft"]).default("draft").notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "messenger", "all"]).default("all"),
  stats: json("stats"), // { triggered, completed, failed }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Automation = typeof automations.$inferSelect;

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId").notNull(),
  channelId: int("channelId"),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "messenger", "web"]).default("web").notNull(),
  status: mysqlEnum("status", ["open", "resolved", "pending", "bot"]).default("open").notNull(),
  assignedTo: int("assignedTo"),
  automationPaused: boolean("automationPaused").default(false).notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  unreadCount: int("unreadCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  contactId: int("contactId"),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  type: mysqlEnum("type", ["text", "image", "video", "audio", "document", "template", "quick_reply"]).default("text").notNull(),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  mediaKey: text("mediaKey"),
  metadata: json("metadata"),
  status: mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

// ─── Broadcasts ───────────────────────────────────────────────────────────────
export const broadcasts = mysqlTable("broadcasts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  message: text("message").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaKey: text("mediaKey"),
  channel: mysqlEnum("channel", ["whatsapp", "instagram", "messenger", "all"]).default("all").notNull(),
  segmentTags: json("segmentTags"), // array of tag IDs to filter contacts
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  stats: json("stats"), // { total, sent, delivered, failed }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Broadcast = typeof broadcasts.$inferSelect;

// ─── Broadcast Recipients ─────────────────────────────────────────────────────
export const broadcastRecipients = mysqlTable("broadcast_recipients", {
  id: int("id").autoincrement().primaryKey(),
  broadcastId: int("broadcastId").notNull(),
  contactId: int("contactId").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "read", "failed"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BroadcastRecipient = typeof broadcastRecipients.$inferSelect;

// ─── Media Files ──────────────────────────────────────────────────────────────
export const mediaFiles = mysqlTable("media_files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  filename: varchar("filename", { length: 256 }).notNull(),
  originalName: varchar("originalName", { length: 256 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  storageKey: text("storageKey").notNull(),
  url: text("url").notNull(),
  type: mysqlEnum("type", ["image", "video", "audio", "document"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaFile = typeof mediaFiles.$inferSelect;

// ─── Analytics Events ─────────────────────────────────────────────────────────
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(), // message_sent, flow_triggered, lead_captured, etc.
  entityType: varchar("entityType", { length: 64 }), // flow, broadcast, automation, conversation
  entityId: int("entityId"),
  contactId: int("contactId"),
  channel: varchar("channel", { length: 32 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
