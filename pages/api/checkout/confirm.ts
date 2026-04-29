import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import {
  getPurchaseOrderForConfirm,
  markPurchaseCompletedById,
  topUpCreditsOnceByEvent,
} from "../../../utils/creditsStore";

const CREEM_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.creem.io"
    : "https://test-api.creem.io";

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
    return null;
  }
}

function verifyCreemRedirectSignature(
  payload: Record<string, unknown>,
  apiKey: string,
): boolean {
  const received = payload.signature;
  if (typeof received !== "string" || !received) return false;

  const filteredEntries = Object.entries(payload)
    .filter(([k, v]) => {
      if (k === "signature") return false;
      if (v == null) return false;
      const s = String(v);
      return s !== "" && s !== "null";
    })
    .sort(([a], [b]) => a.localeCompare(b));

  const canonical = filteredEntries
    .map(([k, v]) => `${k}=${String(v)}`)
    .join("&");
  const expected = crypto.createHmac("sha256", apiKey).update(canonical).digest("hex");
  return expected === received;
}

type CreemCheckout = {
  id?: string;
  request_id?: string;
  status?: string;
  product?: string | { id?: string };
  metadata?: {
    userId?: string;
    user_id?: string;
    planKey?: string;
    plan_key?: string;
    credits?: number | string;
  };
  order?: {
    id?: string;
    status?: string;
    product?: string;
  };
  customer?: {
    id?: string;
    email?: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const currentUserId = resolveUserId(req);

  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "CREEM_API_KEY not set" });

  const payload = (req.body ?? {}) as Record<string, unknown>;
  const hasSignature = typeof payload.signature === "string" && payload.signature.length > 0;
  const signatureValid = hasSignature
    ? verifyCreemRedirectSignature(payload, apiKey)
    : false;

  const callbackCheckoutId =
    typeof payload.checkout_id === "string" ? payload.checkout_id : undefined;
  const callbackRequestId =
    typeof payload.request_id === "string" ? payload.request_id : undefined;
  const callbackPlanKey =
    typeof payload.plan === "string"
      ? payload.plan
      : (typeof payload.plan_key === "string" ? payload.plan_key : undefined);
  const callbackProductId =
    typeof payload.product_id === "string" ? payload.product_id : undefined;
  const callbackOrderId =
    typeof payload.order_id === "string" ? payload.order_id : undefined;
  const callbackCustomerId =
    typeof payload.customer_id === "string" ? payload.customer_id : undefined;

  if (!callbackCheckoutId) {
    return res.status(400).json({ error: "checkout_id missing in callback" });
  }

  const purchase = getPurchaseOrderForConfirm({
    checkoutId: callbackCheckoutId,
    requestId: callbackRequestId,
  });
  if (!purchase) {
    return res.status(404).json({ error: "Purchase order not found" });
  }

  if (callbackRequestId && callbackRequestId !== purchase.request_id) {
    return res.status(400).json({ error: "request_id mismatch" });
  }
  if (callbackPlanKey && callbackPlanKey !== purchase.plan_key) {
    return res.status(400).json({ error: "plan mismatch" });
  }
  if (callbackProductId && callbackProductId !== purchase.product_id) {
    return res.status(400).json({ error: "product mismatch" });
  }
  if (purchase.checkout_id && purchase.checkout_id !== callbackCheckoutId) {
    return res.status(400).json({ error: "checkout mismatch" });
  }
  if (currentUserId && currentUserId !== "local-dev-user" && purchase.user_id !== currentUserId) {
    return res.status(403).json({ error: "User mismatch" });
  }

  const queries = [
    `?checkout_id=${encodeURIComponent(callbackCheckoutId)}`,
    ...(callbackRequestId
      ? [
          `?checkout_id=${encodeURIComponent(callbackCheckoutId)}&request_id=${encodeURIComponent(callbackRequestId)}`,
        ]
      : []),
  ];

  let checkout: CreemCheckout | null = null;
  let lastCreemError = "";
  for (const query of queries) {
    const creemRes = await fetch(`${CREEM_BASE_URL}/v1/checkouts${query}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!creemRes.ok) {
      lastCreemError = await creemRes.text();
      continue;
    }

    checkout = await creemRes.json() as CreemCheckout;
    break;
  }

  if (!checkout) {
    return res.status(502).json({ error: `Creem verify failed: ${lastCreemError || "unknown error"}` });
  }
  if (checkout.id !== callbackCheckoutId) {
    return res.status(400).json({ error: "checkout_id mismatch" });
  }
  if (checkout.request_id && checkout.request_id !== purchase.request_id) {
    return res.status(400).json({ error: "Checkout request_id mismatch" });
  }

  const checkoutUserId = checkout.metadata?.userId ?? checkout.metadata?.user_id;
  if (checkoutUserId && checkoutUserId !== purchase.user_id) {
    return res.status(400).json({ error: "Checkout metadata user mismatch" });
  }

  const status = (checkout.status ?? "").toLowerCase();
  const orderStatus = (checkout.order?.status ?? "").toLowerCase();
  const isPaid =
    status === "completed" || status === "paid" || orderStatus === "paid";

  if (!isPaid) {
    return res.status(409).json({
      error: `Checkout not completed yet (checkout=${status || "unknown"}, order=${orderStatus || "unknown"})`,
    });
  }

  const checkoutPlanKey = checkout.metadata?.planKey ?? checkout.metadata?.plan_key;
  if (checkoutPlanKey && checkoutPlanKey !== purchase.plan_key) {
    return res.status(400).json({ error: "Checkout metadata plan mismatch" });
  }

  const checkoutProductId =
    typeof checkout.product === "string"
      ? checkout.product
      : checkout.product?.id ?? checkout.order?.product;
  if (checkoutProductId && checkoutProductId !== purchase.product_id) {
    return res.status(400).json({ error: "Checkout product mismatch" });
  }

  const creditsToAdd = purchase.credits;
  const result = topUpCreditsOnceByEvent(
    `checkout:${checkout.id}`,
    "checkout.confirmed",
    purchase.user_id,
    creditsToAdd,
    "purchase",
    {
      checkoutId: checkout.id,
      requestId: purchase.request_id,
      orderId: checkout.order?.id ?? callbackOrderId,
      orderStatus: checkout.order?.status,
      planKey: purchase.plan_key,
      productId: purchase.product_id,
      customerId: checkout.customer?.id ?? callbackCustomerId,
      customerEmail: checkout.customer?.email,
      source: "success_callback",
    },
  );

  markPurchaseCompletedById({
    id: purchase.id,
    checkoutId: checkout.id ?? callbackCheckoutId,
    orderId: checkout.order?.id ?? callbackOrderId,
    customerId: checkout.customer?.id ?? callbackCustomerId,
  });

  return res.status(200).json({
    ok: true,
    alreadyProcessed: !result.applied,
    signatureVerified: signatureValid,
    credits: result.credits,
  });
}
