import Stripe from "stripe";

// Central Stripe server-side singleton
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Cast to any until types include this date; keep runtime safety via env tests
  apiVersion: "2024-08-16" as any,
});
