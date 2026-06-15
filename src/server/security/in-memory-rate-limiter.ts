export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

export class InMemoryRateLimiter {
  private readonly entries = new Map<string, Entry>();

  check(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
    const now = Date.now();
    const windowMs = Math.max(1, windowSeconds) * 1000;
    const existing = this.entries.get(key);

    if (!existing || existing.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + windowMs });
      return {
        allowed: true,
        retryAfterSeconds: windowSeconds,
        remaining: Math.max(0, maxRequests - 1),
      };
    }

    if (existing.count >= maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        remaining: 0,
      };
    }

    existing.count += 1;
    this.entries.set(key, existing);

    return {
      allowed: true,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: Math.max(0, maxRequests - existing.count),
    };
  }
}
