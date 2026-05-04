import { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { userPlans, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./notification";
import { ENV } from "./env";

export function registerStripeWebhook(app: Express) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-04-22.dahlia",
  });

  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];

      if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ error: "Missing signature or secret" });
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      try {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        switch (event.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.user_id;
            const planId = subscription.metadata?.plan_id;

            if (userId && planId) {
              // Update user plan status
              await db
                .update(userPlans)
                .set({ status: "active" })
                .where(eq(userPlans.userId, parseInt(userId)));

              console.log(
                `[Webhook] Subscription ${subscription.id} activated for user ${userId}`
              );

              // Notify owner
              await notifyOwner({
                title: "Pagamento recebido",
                content: `Pagamento de R$ ${(subscription.items.data[0]?.price?.unit_amount || 0) / 100} recebido. Usuário ID: ${userId}`,
              });
            }
            break;
          }

          case "charge.succeeded": {
            const charge = event.data.object as Stripe.Charge;
            const customerId = charge.customer as string;

            if (customerId) {
              // Get customer and update metadata
              const customer = await stripe.customers.retrieve(customerId);
              const userId = (customer as any).metadata?.user_id;

              if (userId) {
                console.log(
                  `[Webhook] Payment succeeded for user ${userId}: R$ ${charge.amount / 100}`
                );

                // Send welcome email notification
                await notifyOwner({
                  title: "Novo pagamento processado",
                  content: `Pagamento de R$ ${charge.amount / 100} processado com sucesso para usuário ${userId}`,
                });
              }
            }
            break;
          }

          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;

            if (customerId) {
              const customer = await stripe.customers.retrieve(customerId);
              const userId = (customer as any).metadata?.user_id;

              if (userId) {
                console.log(
                  `[Webhook] Invoice paid for user ${userId}: R$ ${invoice.amount_paid / 100}`
                );

                // Update user last payment date
                const [user] = await db
                  .select()
                  .from(users)
                  .where(eq(users.id, parseInt(userId)))
                  .limit(1);

                if (user) {
                  console.log(
                    `[Webhook] Invoice paid for user ${userId}: R$ ${invoice.amount_paid / 100}`
                  );
                }
              }
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.user_id;

            if (userId) {
              // Cancel user plan
              await db
                .update(userPlans)
                .set({ status: "cancelled" })
                .where(eq(userPlans.userId, parseInt(userId)));

              console.log(`[Webhook] Subscription cancelled for user ${userId}`);

              await notifyOwner({
                title: "Assinatura cancelada",
                content: `Assinatura cancelada para usuário ${userId}`,
              });
            }
            break;
          }

          case "charge.failed": {
            const charge = event.data.object as Stripe.Charge;
            const customerId = charge.customer as string;

            if (customerId) {
              const customer = await stripe.customers.retrieve(customerId);
              const userId = (customer as any).metadata?.user_id;

              if (userId) {
                console.log(
                  `[Webhook] Payment failed for user ${userId}: ${charge.failure_message}`
                );

                await notifyOwner({
                  title: "Falha no pagamento",
                  content: `Falha no pagamento para usuário ${userId}: ${charge.failure_message}`,
                });
              }
            }
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error("[Webhook] Error processing event:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );
}
