import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  isCreemEventProcessed,
  markCreemEventProcessed,
  topUpCreditsOnceByEvent,
} from "../../../utils/creditsStore";

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const incoming = signature.includes("=") ? signature.split("=").pop() ?? "" : signature;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return computed === incoming;
}

type CreemEvent = {
  id?: string;
  eventType?: string;
  event_type?: string;
  type?: string;
  object?: {
    id?: string;
    metadata?: {
      userId?: string;
      planKey?: string;
      credits?: number | string;
      user_id?: string;
      plan_key?: string;
    };
    order?: { id?: string; status?: string };
    product?: { id?: string; name?: string };
    customer?: { id?: string; email?: string };
  };
  data?: {
    object?: CreemEvent["object"];
  };
};

function resolveEventType(event: CreemEvent): string {
  return event.eventType ?? event.event_type ?? event.type ?? "unknown";
}

function resolveEventObject(event: CreemEvent): NonNullable<CreemEvent["object"]> {
  return event.object ?? event.data?.object ?? {};
}

function resolveUserIdFromEvent(event: CreemEvent): string | null {
  const object = resolveEventObject(event);
  const meta = object.metadata ?? {};
  return meta.userId ?? meta.user_id ?? null;
}

function resolvePlanKeyFromEvent(event: CreemEvent): string | null {
  const object = resolveEventObject(event);
  const meta = object.metadata ?? {};
  return meta.planKey ?? meta.plan_key ?? null;
}

function resolveCreditsFromEvent(event: CreemEvent): number {
  const object = resolveEventObject(event);
  const meta = object.metadata ?? {};
  const parsed = Number(meta.credits ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Minimal integration mode: webhook is optional.
    return res.status(200).json({ received: true, skipped: "webhook_secret_not_configured" });
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["creem-signature"] as string | undefined;

  if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
    console.warn("Creem webhook: invalid signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  let event: CreemEvent;
  try {
    event = JSON.parse(rawBody) as CreemEvent;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const eventType = resolveEventType(event);
  const eventId =
    event.id ??
    req.headers["x-creem-event-id"]?.toString() ??
    crypto.createHash("sha256").update(rawBody).digest("hex");

  if (isCreemEventProcessed(eventId)) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  if (eventType === "checkout.completed") {
    const userId = resolveUserIdFromEvent(event);
    const planKey = resolvePlanKeyFromEvent(event);
    const credits = resolveCreditsFromEvent(event);
    const object = resolveEventObject(event);

    if (!userId || credits <= 0) {
      console.warn("Creem webhook: missing userId or credits in metadata", object.metadata);
      markCreemEventProcessed(eventId, eventType);
      return res.status(200).json({ received: true });
    }

    topUpCreditsOnceByEvent(
      `checkout:${object.id ?? eventId}`,
      eventType,
      userId,
      credits,
      "purchase",
      {
        eventId,
        checkoutId: object.id,
        orderId: object.order?.id,
        planKey,
        productId: object.product?.id,
        customerId: object.customer?.id,
        customerEmail: object.customer?.email,
        source: "webhook",
      },
    );
  }

  markCreemEventProcessed(eventId, eventType);
  return res.status(200).json({ received: true });
}
