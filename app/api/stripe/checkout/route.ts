import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isMockMode } from "@/lib/config";
import { getAppBaseUrl, isStripeConfigured } from "@/lib/config/site";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";
import { getStripe, pkrToStripeUnitAmount } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const toolId = body?.toolId as string | undefined;
  const planId = body?.planId as string | undefined;

  try {
    if (planId) {
      return await handlePlanCheckout(session.user.id, session.user.email, planId);
    }

    if (toolId) {
      return await handleToolCheckout(session.user.id, session.user.email, toolId);
    }
  } catch (err) {
    const message =
      err instanceof Error && "code" in err && err.code === "amount_too_small"
        ? "This price is below Stripe's minimum charge. Contact support or choose a higher plan."
        : err instanceof Error
          ? err.message
          : "Could not start Stripe checkout";
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json(
    { error: "toolId or planId is required" },
    { status: 400 }
  );
}

async function handlePlanCheckout(
  userId: string,
  email: string | null | undefined,
  planId: string
) {
  let plan: {
    id: string;
    name: string;
    description: string | null;
    pricePkr: number;
    durationDays: number;
    active: boolean;
  };

  if (isMockMode()) {
    const found = mockStore.plans.find((p) => p.id === planId);
    if (!found || !found.active) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }
    plan = found;
  } else {
    const found = await prisma.plan.findUnique({ where: { id: planId } });
    if (!found || !found.active) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }
    plan = found;
  }

  const stripe = getStripe();
  const baseUrl = getAppBaseUrl();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "pkr",
          unit_amount: pkrToStripeUnitAmount(plan.pricePkr),
          product_data: {
            name: `${plan.name} subscription`,
            description:
              plan.description ??
              `${plan.durationDays} days access to included SEO tools`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "plan",
      planId,
      userId,
    },
    success_url: `${baseUrl}/dashboard/subscription?activated=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/subscription?canceled=1`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Stripe could not create a checkout session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}

async function handleToolCheckout(
  userId: string,
  email: string | null | undefined,
  toolId: string
) {
  let tool: {
    id: string;
    name: string;
    slug: string;
    pricePkr: number;
    accessDurationDays: number;
    active: boolean;
  };

  if (isMockMode()) {
    const found = mockStore.tools.find((t) => t.id === toolId);
    if (!found || !found.active) {
      return NextResponse.json({ error: "Tool not available" }, { status: 404 });
    }
    tool = found;
  } else {
    const found = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!found || !found.active) {
      return NextResponse.json({ error: "Tool not available" }, { status: 404 });
    }
    tool = found;

    const pending = await prisma.paymentOrder.findFirst({
      where: { userId, toolId, status: "PENDING" },
    });
    if (pending) {
      return NextResponse.json(
        { error: "You already have a pending payment for this tool" },
        { status: 409 }
      );
    }
  }

  const stripe = getStripe();
  const baseUrl = getAppBaseUrl();

  const metadata: Record<string, string> = {
    type: "tool",
    userId,
    toolId,
  };

  if (!isMockMode()) {
    const order = await prisma.paymentOrder.create({
      data: {
        userId,
        toolId,
        amountPkr: tool.pricePkr,
        paymentMethod: "STRIPE",
        status: "PENDING",
      },
    });
    metadata.orderId = order.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "pkr",
          unit_amount: pkrToStripeUnitAmount(tool.pricePkr),
          product_data: {
            name: tool.name,
            description: `${tool.accessDurationDays} days access`,
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    success_url: `${baseUrl}/dashboard/orders?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/buy/${tool.slug}?canceled=1`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Stripe could not create a checkout session" },
      { status: 500 }
    );
  }

  if (!isMockMode() && metadata.orderId) {
    await prisma.paymentOrder.update({
      where: { id: metadata.orderId },
      data: { stripeSessionId: checkoutSession.id },
    });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
