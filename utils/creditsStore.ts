import { supabaseAdmin } from "./supabase";

type CreditRow = {
  user_id: string;
  balance: number;
  total_bought: number;
  total_used: number;
  updated_at: string;
  created_at: string;
};

type ProcessedEventRow = {
  event_id: string;
  event_type: string;
  created_at: string;
};

type PurchaseOrderRow = {
  id: number;
  user_id: string;
  plan_key: string;
  product_id: string;
  credits: number;
  request_id: string;
  checkout_id: string | null;
  order_id: string | null;
  customer_id: string | null;
  status: string;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseOrder = PurchaseOrderRow;

async function ensureUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_credits")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to ensure user credits: ${error.message}`);
  if (data) return;

  const now = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin
    .from("user_credits")
    .insert({
      user_id: userId,
      balance: 0,
      total_bought: 0,
      total_used: 0,
      created_at: now,
      updated_at: now,
    });
  if (insertError) {
    // Ignore unique conflict on race.
    if (!insertError.message.toLowerCase().includes("duplicate")) {
      throw new Error(`Failed to create user credits row: ${insertError.message}`);
    }
  }
}

export async function getCredits(userId: string) {
  await ensureUser(userId);
  const { data, error } = await supabaseAdmin
    .from("user_credits")
    .select("user_id,balance,total_bought,total_used,updated_at,created_at")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(`Failed to read credits: ${error.message}`);
  return data as CreditRow;
}

export async function topUpCredits(
  userId: string,
  credits: number,
  reason: string,
  meta?: Record<string, unknown>,
) {
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("credits must be > 0");
  }

  const current = await getCredits(userId);
  const now = new Date().toISOString();
  const next = {
    balance: current.balance + credits,
    total_bought: current.total_bought + credits,
    updated_at: now,
  };

  const { error: updateError } = await supabaseAdmin
    .from("user_credits")
    .update(next)
    .eq("user_id", userId);
  if (updateError) throw new Error(`Failed to top up credits: ${updateError.message}`);

  const { error: txError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      delta: credits,
      reason,
      meta: meta ?? null,
      created_at: now,
    });
  if (txError) throw new Error(`Failed to write credit transaction: ${txError.message}`);

  return getCredits(userId);
}

export async function topUpCreditsOnceByEvent(
  eventId: string,
  eventType: string,
  userId: string,
  credits: number,
  reason: string,
  meta?: Record<string, unknown>,
) {
  if (!eventId) throw new Error("eventId is required");
  if (!Number.isFinite(credits) || credits <= 0) throw new Error("credits must be > 0");

  const { data: existing, error: readError } = await supabaseAdmin
    .from("processed_events")
    .select("event_id,event_type,created_at")
    .eq("event_id", eventId)
    .maybeSingle();
  if (readError) throw new Error(`Failed to check processed event: ${readError.message}`);

  if (existing) {
    return { applied: false as const, credits: await getCredits(userId) };
  }

  const now = new Date().toISOString();
  const { error: insertEventError } = await supabaseAdmin
    .from("processed_events")
    .insert({ event_id: eventId, event_type: eventType, created_at: now } as ProcessedEventRow);

  if (insertEventError) {
    if (insertEventError.message.toLowerCase().includes("duplicate")) {
      return { applied: false as const, credits: await getCredits(userId) };
    }
    throw new Error(`Failed to insert processed event: ${insertEventError.message}`);
  }

  const updated = await topUpCredits(userId, credits, reason, meta);
  return { applied: true as const, credits: updated };
}

export async function deductCredit(
  userId: string,
  credits = 1,
  reason = "image_generation",
  meta?: Record<string, unknown>,
) {
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("credits must be > 0");
  }

  const current = await getCredits(userId);
  if (current.balance < credits) {
    throw new Error("insufficient_credits");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from("user_credits")
    .update({
      balance: current.balance - credits,
      total_used: current.total_used + credits,
      updated_at: now,
    })
    .eq("user_id", userId)
    .gte("balance", credits);

  if (updateError) throw new Error(`Failed to deduct credits: ${updateError.message}`);

  const { error: txError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      delta: -credits,
      reason,
      meta: meta ?? null,
      created_at: now,
    });
  if (txError) throw new Error(`Failed to write credit transaction: ${txError.message}`);

  return getCredits(userId);
}

export async function isCreemEventProcessed(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from("processed_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw new Error(`Failed to check event processed: ${error.message}`);
  return Boolean(data);
}

export async function markCreemEventProcessed(eventId: string, eventType: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("processed_events")
    .upsert({ event_id: eventId, event_type: eventType, created_at: now }, { onConflict: "event_id" });

  return !error;
}

export async function createPurchaseOrder(input: {
  userId: string;
  planKey: string;
  productId: string;
  credits: number;
  requestId: string;
  meta?: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .insert({
      user_id: input.userId,
      plan_key: input.planKey,
      product_id: input.productId,
      credits: input.credits,
      request_id: input.requestId,
      status: "created",
      meta: input.meta ?? null,
      created_at: now,
      updated_at: now,
    });

  if (error) throw new Error(`Failed to create purchase order: ${error.message}`);
}

export async function markPurchaseCheckoutCreated(
  requestId: string,
  input: { checkoutId?: string | null; meta?: Record<string, unknown> },
) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .update({
      checkout_id: input.checkoutId ?? null,
      status: "checkout_created",
      meta: input.meta ?? null,
      updated_at: now,
    })
    .eq("request_id", requestId);

  if (error) throw new Error(`Failed to mark checkout created: ${error.message}`);
}

export async function markPurchaseFailed(requestId: string, meta?: Record<string, unknown>) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .update({
      status: "failed",
      meta: meta ?? null,
      updated_at: now,
    })
    .eq("request_id", requestId);

  if (error) throw new Error(`Failed to mark purchase failed: ${error.message}`);
}

export async function getPurchaseOrderForConfirm(input: {
  checkoutId?: string;
  requestId?: string;
}) {
  if (input.checkoutId) {
    const { data, error } = await supabaseAdmin
      .from("purchase_orders")
      .select("id,user_id,plan_key,product_id,credits,request_id,checkout_id,order_id,customer_id,status,meta,created_at,updated_at")
      .eq("checkout_id", input.checkoutId)
      .maybeSingle();

    if (error) throw new Error(`Failed to read purchase by checkoutId: ${error.message}`);
    if (data) return data as PurchaseOrder;
  }

  if (input.requestId) {
    const { data, error } = await supabaseAdmin
      .from("purchase_orders")
      .select("id,user_id,plan_key,product_id,credits,request_id,checkout_id,order_id,customer_id,status,meta,created_at,updated_at")
      .eq("request_id", input.requestId)
      .maybeSingle();

    if (error) throw new Error(`Failed to read purchase by requestId: ${error.message}`);
    if (data) return data as PurchaseOrder;
  }

  return null;
}

export async function markPurchaseCompletedById(input: {
  id: number;
  checkoutId?: string | null;
  orderId?: string | null;
  customerId?: string | null;
}) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .update({
      checkout_id: input.checkoutId ?? null,
      order_id: input.orderId ?? null,
      customer_id: input.customerId ?? null,
      status: "completed",
      updated_at: now,
    })
    .eq("id", input.id);

  if (error) throw new Error(`Failed to mark purchase completed: ${error.message}`);
}
