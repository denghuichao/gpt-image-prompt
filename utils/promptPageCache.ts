type PromptPageCacheValue = {
  templates: unknown[];
  nextCursor: number | null;
  hasMore: boolean;
};

type CacheEntry = {
  value: PromptPageCacheValue;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function getTtlMs() {
  const raw = Number(process.env.PROMPTS_API_CACHE_TTL_MS ?? "30000");
  if (!Number.isFinite(raw) || raw <= 0) return 30000;
  return Math.min(Math.max(Math.floor(raw), 5000), 300000);
}

function getMaxEntries() {
  const raw = Number(process.env.PROMPTS_API_CACHE_MAX_ENTRIES ?? "500");
  if (!Number.isFinite(raw) || raw <= 0) return 500;
  return Math.min(Math.max(Math.floor(raw), 50), 5000);
}

export function getPromptPageCache(key: string): PromptPageCacheValue | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

export function setPromptPageCache(key: string, value: PromptPageCacheValue) {
  const maxEntries = getMaxEntries();
  if (cache.size >= maxEntries) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, {
    value,
    expiresAt: Date.now() + getTtlMs(),
  });
}

export function clearPromptPageCache() {
  cache.clear();
}
