import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { dashboardRouter } from "./routers/dashboard";
import { contactsRouter } from "./routers/contacts";
import { flowsRouter } from "./routers/flows";
import { automationsRouter } from "./routers/automations";
import { broadcastsRouter } from "./routers/broadcasts";
import { conversationsRouter } from "./routers/conversations";
import { analyticsRouter } from "./routers/analytics";
import { channelsRouter } from "./routers/channels";
import { plansRouter } from "./routers/plans";
import { templatesRouter } from "./routers/templates";
import { mediaRouter } from "./routers/media";
import { aiRouter } from "./routers/ai";
import { oauthRouter } from "./routers/oauth";
import { adminRouter } from "./routers/admin";
import { metricsRouter } from "./routers/metrics";
import { settingsRouter } from "./routers/settings";
import { whatsappRouter } from "./routers/whatsapp";


export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: dashboardRouter,
  contacts: contactsRouter,
  flows: flowsRouter,
  automations: automationsRouter,
  broadcasts: broadcastsRouter,
  conversations: conversationsRouter,
  analytics: analyticsRouter,
  channels: channelsRouter,
  plans: plansRouter,
  templates: templatesRouter,
  media: mediaRouter,
  ai: aiRouter,
  oauth: oauthRouter,
  admin: adminRouter,
  metrics: metricsRouter,
  settings: settingsRouter,
  whatsapp: whatsappRouter,

});

export type AppRouter = typeof appRouter;
