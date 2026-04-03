const store = new Map<string, number[]>();

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store) {
    const filtered = timestamps.filter((t) => t > now - 600_000);
    if (filtered.length === 0) store.delete(key);
    else store.set(key, filtered);
  }
}, 60_000);

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (store.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return { success: false, remaining: 0, retryAfterMs };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { success: true, remaining: limit - timestamps.length, retryAfterMs: 0 };
}