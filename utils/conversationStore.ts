import { supabaseAdmin } from "./supabase";

export type StoredChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  tags?: string[];
  images?: string[];
  referenceImages?: Array<{ name: string; url: string }>;
  loading?: boolean;
};

type ConversationRow = {
  user_id: string;
  template_key: string;
  messages: StoredChatMessage[];
  updated_at: string;
  created_at: string;
};

export async function getConversation(userId: string, templateKey: string) {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("user_id,template_key,messages,updated_at,created_at")
    .eq("user_id", userId)
    .eq("template_key", templateKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }

  if (!data) return null;
  const row = data as ConversationRow;
  return {
    userId: row.user_id,
    templateKey: row.template_key,
    messages: Array.isArray(row.messages) ? row.messages : [],
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export async function upsertConversation(userId: string, templateKey: string, messages: StoredChatMessage[]) {
  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    template_key: templateKey,
    messages,
    updated_at: now,
    created_at: now,
  };

  const { error } = await supabaseAdmin
    .from("conversations")
    .upsert(payload, { onConflict: "user_id,template_key" });

  if (error) {
    throw new Error(`Failed to save conversation: ${error.message}`);
  }

  return getConversation(userId, templateKey);
}
