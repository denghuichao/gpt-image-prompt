import db from "./sqlite";

export type StoredChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  tags?: string[];
  images?: string[];
  referenceImages?: Array<{ name: string; url: string }>;
};

type ConversationRow = {
  user_id: string;
  template_key: string;
  messages_json: string;
  updated_at: number;
  created_at: number;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    user_id TEXT NOT NULL,
    template_key TEXT NOT NULL,
    messages_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, template_key)
  )
`);

const selectStmt = db.prepare(
  `SELECT user_id, template_key, messages_json, updated_at, created_at
   FROM conversations
   WHERE user_id = ? AND template_key = ?`,
);

const upsertStmt = db.prepare(`
  INSERT INTO conversations (user_id, template_key, messages_json, updated_at, created_at)
  VALUES (@user_id, @template_key, @messages_json, @updated_at, @created_at)
  ON CONFLICT(user_id, template_key) DO UPDATE SET
    messages_json = excluded.messages_json,
    updated_at = excluded.updated_at
`);

export function getConversation(userId: string, templateKey: string) {
  const row = selectStmt.get(userId, templateKey) as ConversationRow | undefined;
  if (!row) {
    return null;
  }

  let messages: StoredChatMessage[] = [];
  try {
    const parsed = JSON.parse(row.messages_json);
    if (Array.isArray(parsed)) {
      messages = parsed;
    }
  } catch {
    messages = [];
  }

  return {
    userId: row.user_id,
    templateKey: row.template_key,
    messages,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export function upsertConversation(userId: string, templateKey: string, messages: StoredChatMessage[]) {
  const now = Date.now();
  upsertStmt.run({
    user_id: userId,
    template_key: templateKey,
    messages_json: JSON.stringify(messages),
    updated_at: now,
    created_at: now,
  });

  return getConversation(userId, templateKey);
}
