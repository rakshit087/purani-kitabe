import Redis from "ioredis";

type MemoryEntry = {
  value: string;
  expiresAt: number;
};

const memoryCache = new Map<string, MemoryEntry>();
const REDIS_RETRY_COOLDOWN_MS = 30_000;

let nextRedisAttemptAt = 0;

const redisUrl = process.env.REDIS_URL;
const redisClient = redisUrl
  ? new Redis(redisUrl, {
      connectTimeout: 1000,
      commandTimeout: 1000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: () => null,
      autoResendUnfulfilledCommands: false,
    })
  : null;

const markRedisUnavailable = (err: unknown) => {
  nextRedisAttemptAt = Date.now() + REDIS_RETRY_COOLDOWN_MS;
  console.error("Redis cache unavailable, using fallback cache:", err);
};

redisClient?.on("error", (err) => {
  markRedisUnavailable(err.message);
});

const getFallback = (key: string): string | null => {
  const cached = memoryCache.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value;
};

const setFallback = (key: string, value: string, ttlSeconds: number) => {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

const shouldUseRedis = () =>
  redisClient !== null && Date.now() >= nextRedisAttemptAt;

const redis = {
  async get(key: string): Promise<string | null> {
    if (!shouldUseRedis()) {
      return getFallback(key);
    }

    try {
      const cached = await redisClient!.get(key);
      return cached ?? getFallback(key);
    } catch (err) {
      markRedisUnavailable(err);
      return getFallback(key);
    }
  },

  async set(
    key: string,
    value: string,
    expiryMode: "EX",
    ttlSeconds: number
  ): Promise<"OK" | null> {
    setFallback(key, value, ttlSeconds);

    if (!shouldUseRedis()) {
      return "OK";
    }

    try {
      return await redisClient!.set(key, value, expiryMode, ttlSeconds);
    } catch (err) {
      markRedisUnavailable(err);
      return "OK";
    }
  },
};

export default redis;
