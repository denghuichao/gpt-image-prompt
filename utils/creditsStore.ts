import db from "./sqlite";

db.exec(`
  CREATE TABLE IF NOT EXISTS user_credits (
    user_id TEXT PRIMARY KEY,
    balance INTEGER NOT NULL DEFAULT 0,
    total_bought INTEGER NOT NULL DEFAULT 0,
    total_used INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS credit_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    meta TEXT,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS creem_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    plan_key TEXT NOT NULL,
    product_id TEXT NOT NULL,
    credits INTEGER NOT NULL,
    request_id TEXT NOT NULL UNIQUE,
    checkout_id TEXT,
    order_id TEXT,
    customer_id TEXT,
    status TEXT NOT NULL,
    meta TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

type CreditRow = {
  user_id: string;
  balance: number;
  total_bought: number;
  total_used: number;
  updated_at: number;
  created_at: number;
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
  meta: string | null;
  created_at: number;
  updated_at: number;
};

export type PurchaseOrder = PurchaseOrderRow;

const selectCredits = db.prepare(
  `SELECT * FROM user_credits WHERE user_id = ?`,
);

const insertCredits = db.prepare(`
  INSERT INTO user_credits (user_id, balance, total_bought, total_used, updated_at, created_at)
  VALUES (?, 0, 0, 0, ?, ?)
`);

const addCreditsStmt = db.prepare(`
  UPDATE user_credits
  SET balance = balance + ?, total_bought = total_bought + ?, updated_at = ?
  WHERE user_id = ?
`);

const deductCreditsStmt = db.prepare(`
  UPDATE user_credits
  SET balance = balance - ?, total_used = total_used + ?, updated_at = ?
  WHERE user_id = ? AND balance >= ?
`);

const insertTransaction = db.prepare(`
  INSERT INTO credit_transactions (user_id, delta, reason, meta, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const insertWebhookEvent = db.prepare(
  `INSERT INTO creem_webhook_events (event_id, event_type, created_at) VALUES (?, ?, ?)`,
);

const insertPurchaseOrderStmt = db.prepare(`
  INSERT INTO purchase_orders (
    user_id, plan_key, product_id, credits, request_id, status, meta, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getPurchaseByRequestIdStmt = db.prepare(
  `SELECT * FROM purchase_orders WHERE request_id = ?`,
);

const getPurchaseByCheckoutIdStmt = db.prepare(
  `SELECT * FROM purchase_orders WHERE checkout_id = ?`,
);

const updatePurchaseFromCheckoutStmt = db.prepare(`
  UPDATE purchase_orders
  SET checkout_id = COALESCE(checkout_id, ?),
      status = ?,
      meta = ?,
      updated_at = ?
  WHERE request_id = ?
`);

const markPurchaseCompletedStmt = db.prepare(`
  UPDATE purchase_orders
  SET checkout_id = COALESCE(checkout_id, ?),
      order_id = COALESCE(order_id, ?),
      customer_id = COALESCE(customer_id, ?),
      status = 'completed',
      updated_at = ?
  WHERE id = ?
`);

const markPurchaseFailedStmt = db.prepare(`
  UPDATE purchase_orders
  SET status = 'failed', meta = ?, updated_at = ?
  WHERE request_id = ?
`);

function ensureUser(userId: string) {
  const row = selectCredits.get(userId) as CreditRow | undefined;
  if (!row) {
    const now = Date.now();
    insertCredits.run(userId, now, now);
  }
}

export function getCredits(userId: string) {
  ensureUser(userId);
  return selectCredits.get(userId) as CreditRow;
}

export function topUpCredits(
  userId: string,
  credits: number,
  reason: string,
  meta?: Record<string, unknown>,
) {
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("credits must be > 0");
  }
  ensureUser(userId);

  const now = Date.now();
  addCreditsStmt.run(credits, credits, now, userId);
  insertTransaction.run(
    userId,
    credits,
    reason,
    meta ? JSON.stringify(meta) : null,
    now,
  );

  return getCredits(userId);
}

export function topUpCreditsOnceByEvent(
  eventId: string,
  eventType: string,
  userId: string,
  credits: number,
  reason: string,
  meta?: Record<string, unknown>,
) {
  if (!eventId) {
    throw new Error("eventId is required");
  }
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("credits must be > 0");
  }

  const run = (db as unknown as { transaction: <T>(fn: () => T) => () => T }).transaction(() => {
    ensureUser(userId);
    try {
      insertWebhookEvent.run(eventId, eventType, Date.now());
    } catch {
      return { applied: false as const, credits: getCredits(userId) };
    }

    const now = Date.now();
    addCreditsStmt.run(credits, credits, now, userId);
    insertTransaction.run(
      userId,
      credits,
      reason,
      meta ? JSON.stringify(meta) : null,
      now,
    );

    return { applied: true as const, credits: getCredits(userId) };
  });

  return run();
}

export function deductCredit(
  userId: string,
  credits = 1,
  reason = "image_generation",
  meta?: Record<string, unknown>,
) {
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("credits must be > 0");
  }
  ensureUser(userId);

  const now = Date.now();
  const result = deductCreditsStmt.run(credits, credits, now, userId, credits);
  if (result.changes === 0) {
    throw new Error("insufficient_credits");
  }
  insertTransaction.run(
    userId,
    -credits,
    reason,
    meta ? JSON.stringify(meta) : null,
    now,
  );
  return getCredits(userId);
}

export function isCreemEventProcessed(eventId: string) {
  const row = db
    .prepare(`SELECT event_id FROM creem_webhook_events WHERE event_id = ?`)
    .get(eventId) as { event_id: string } | undefined;
  return Boolean(row);
}

export function markCreemEventProcessed(eventId: string, eventType: string) {
  try {
    insertWebhookEvent.run(eventId, eventType, Date.now());
    return true;
  } catch {
    return false;
  }
}

export function createPurchaseOrder(input: {
  userId: string;
  planKey: string;
  productId: string;
  credits: number;
  requestId: string;
  meta?: Record<string, unknown>;
}) {
  const now = Date.now();
  insertPurchaseOrderStmt.run(
    input.userId,
    input.planKey,
    input.productId,
    input.credits,
    input.requestId,
    "created",
    input.meta ? JSON.stringify(input.meta) : null,
    now,
    now,
  );
}

export function markPurchaseCheckoutCreated(
  requestId: string,
  input: { checkoutId?: string | null; meta?: Record<string, unknown> },
) {
  const now = Date.now();
  updatePurchaseFromCheckoutStmt.run(
    input.checkoutId ?? null,
    "checkout_created",
    input.meta ? JSON.stringify(input.meta) : null,
    now,
    requestId,
  );
}

export function markPurchaseFailed(requestId: string, meta?: Record<string, unknown>) {
  markPurchaseFailedStmt.run(
    meta ? JSON.stringify(meta) : null,
    Date.now(),
    requestId,
  );
}

export function getPurchaseOrderForConfirm(input: {
  checkoutId?: string;
  requestId?: string;
}) {
  let row: PurchaseOrderRow | undefined;
  if (input.checkoutId) {
    row = getPurchaseByCheckoutIdStmt.get(input.checkoutId) as PurchaseOrderRow | undefined;
  }
  if (!row && input.requestId) {
    row = getPurchaseByRequestIdStmt.get(input.requestId) as PurchaseOrderRow | undefined;
  }
  return (row as PurchaseOrder | undefined) ?? null;
}

export function markPurchaseCompletedById(input: {
  id: number;
  checkoutId?: string | null;
  orderId?: string | null;
  customerId?: string | null;
}) {
  markPurchaseCompletedStmt.run(
    input.checkoutId ?? null,
    input.orderId ?? null,
    input.customerId ?? null,
    Date.now(),
    input.id,
  );
}
