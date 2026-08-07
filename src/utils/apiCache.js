// Lightweight client-side API cache with configurable TTL (Time-To-Live)

const cacheStore = new Map();

export const getCachedData = (key) => {
  const cached = cacheStore.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return cached.data;
};

export const setCachedData = (key, data, ttlMs = 30000) => {
  cacheStore.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
};

export const clearApiCache = (keyPattern) => {
  if (!keyPattern) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.includes(keyPattern)) {
      cacheStore.delete(key);
    }
  }
};
