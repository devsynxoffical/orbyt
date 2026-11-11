import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/config/site";

/** Stripe PKR uses paisa (1/100 rupee); our app stores whole rupees. */
export function pkrToStripeUnitAmount(pricePkr: number): number {
  return Math.round(pricePkr * 100);
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}
