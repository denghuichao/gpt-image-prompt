import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import pricingConfig from "../../config/pricing.json";
import {
  createPurchaseOrder,
  markPurchaseCheckoutCreated,
  markPurchaseFailed,
} from "../../utils/creditsStore";

function resolveUserId(req: NextApiRequest): string | null {
  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
  if (!hasClerk) return "local-dev-user";
  try {
    const { userId } = getAuth(req);
    return userId ?? null;
  } catch {
    return "local-dev-user";
  }
}

const CREEM_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.creem.io"
    : "https://test-api.creem.io";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = resolveUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { planKey } = req.body as { planKey?: string };
  const plan = pricingConfig.plans.find((p) => p.key === planKey);
  if (!plan) return res.status(400).json({ error: "Invalid plan" });
  if (!plan.creem_product_id)
    return res.status(400).json({ error: "Product not configured" });

  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "CREEM_API_KEY not set" });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:3000`;

  const requestId = `checkout_${userId}_${plan.key}_${Date.now()}`;

  createPurchaseOrder({
    userId,
    planKey: plan.key,
    productId: plan.creem_product_id,
    credits: plan.credits,
    requestId,
    meta: { source: "api_checkout_create" },
  });

  const body = {
    product_id: plan.creem_product_id,
    request_id: requestId,
    success_url: `${appUrl}/pricing?success=1&plan=${plan.key}`,
    metadata: {
      userId,
      planKey: plan.key,
      credits: plan.credits,
    },
  };

  const creemRes = await fetch(`${CREEM_BASE_URL}/v1/checkouts`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!creemRes.ok) {
    const text = await creemRes.text();
    markPurchaseFailed(requestId, { source: "creem_create_checkout", error: text });
    return res.status(502).json({ error: `Creem error: ${text}` });
  }

  const data = await creemRes.json() as { checkout_url?: string; id?: string };
  markPurchaseCheckoutCreated(requestId, {
    checkoutId: data.id,
    meta: { checkoutUrl: data.checkout_url ?? null },
  });
  return res.status(200).json({ checkoutUrl: data.checkout_url });
}
