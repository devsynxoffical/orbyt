import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/config/site";
import { fulfillStripePlanPurchase } from "@/lib/payments/activate-plan";
import { fulfillStripePaymentOrder } from "@/lib/payments/grant-access";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function handleCompletedSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const userId = session.metadata?.userId;
  if (!userId) return;

  const type = session.metadata?.type ?? "tool";

  if (type === "plan") {
    const planId = session.metadata?.planId;
    if (!planId) return;
    await fulfillStripePlanPurchase(userId, planId);
    return;
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await fulfillStripePaymentOrder(orderId);
}

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCompletedSession(event.data.object as Stripe.Checkout.Session);
  }

  if (event.type === "checkout.session.async_payment_succeeded") {
    await handleCompletedSession(event.data.object as Stripe.Checkout.Session);
  }

  if (event.type === "checkout.session.expired") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;
    if (orderId && checkoutSession.metadata?.type !== "plan") {
      await prisma.paymentOrder.updateMany({
        where: { id: orderId, status: "PENDING", paymentMethod: "STRIPE" },
        data: { status: "REJECTED", adminNote: "Stripe checkout expired" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
