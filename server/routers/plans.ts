import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { plans, userPlans } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import Stripe from "stripe";
import { ENV } from "../_core/env";

export const plansRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(plans);
  }),

  current: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const [up] = await db
      .select({ userPlan: userPlans, plan: plans })
      .from(userPlans)
      .innerJoin(plans, eq(userPlans.planId, plans.id))
      .where(and(eq(userPlans.userId, ctx.user.id), eq(userPlans.status, "active")))
      .limit(1);
    return up ?? null;
  }),

  subscribe: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Cancel existing plan
      await db.update(userPlans).set({ status: "cancelled" } as any).where(and(eq(userPlans.userId, ctx.user.id), eq(userPlans.status, "active")));

      // Subscribe to new plan
      const [plan] = await db.select().from(plans).where(eq(plans.id, input.planId)).limit(1);
      await db.insert(userPlans).values({
        userId: ctx.user.id,
        planId: input.planId,
        status: "active",
      });

      if (plan) {
        await notifyOwner({
          title: "Novo plano contratado",
          content: `Usuário ${ctx.user.name || ctx.user.email} assinou o plano ${plan.name}.`,
        });
      }

      return { success: true };
    }),

  createCheckout: protectedProcedure
    .input(z.object({ 
      planId: z.number(),
      billingPeriod: z.enum(["monthly", "annual"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Get plan details
      const [plan] = await db.select().from(plans).where(eq(plans.id, input.planId)).limit(1);
      if (!plan) throw new Error("Plan not found");

      // Initialize Stripe
      if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" });

      // Get or create Stripe customer
      const customers = await stripe.customers.list({
        email: ctx.user.email || undefined,
        limit: 1,
      });
      let customerId = customers.data[0]?.id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            user_id: ctx.user.id.toString(),
          },
        });
        customerId = customer.id;
      }

      // Determine price based on billing period
      const price = input.billingPeriod === "annual" ? plan.priceAnnual : plan.priceMonthly;
      const interval = input.billingPeriod === "annual" ? "year" : "month";

      // Create Stripe product and price if needed
      const products = await stripe.products.list({
        limit: 1,
        active: true,
      });
      let productId = products.data[0]?.id;
      if (!productId) {
        const product = await stripe.products.create({
          name: `${plan.name} Plan - ConversaAI`,
          description: `${plan.name} plan for ConversaAI platform`,
          metadata: {
            plan_id: plan.id.toString(),
          },
        });
        productId = product.id;
      }

      // Create price
      const priceObj = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(price * 100), // Convert to cents
        currency: "brl",
        recurring: {
          interval: interval as "month" | "year",
        },
        metadata: {
          plan_id: plan.id.toString(),
        },
      });

      // Create checkout session
      const origin = ctx.req.headers.origin || "https://conversai.manus.space";
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceObj.id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/plans?payment=cancelled`,
        allow_promotion_codes: true,
        metadata: {
          user_id: ctx.user.id.toString(),
          plan_id: plan.id.toString(),
          plan_name: plan.name,
        },
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),
});
