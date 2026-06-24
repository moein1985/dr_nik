import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InMemoryRateLimiter } from "../in-memory-rate-limiter";

describe("InMemoryRateLimiter", () => {
  let rateLimiter: InMemoryRateLimiter;

  beforeEach(() => {
    rateLimiter = new InMemoryRateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests within limit", () => {
    const result1 = rateLimiter.check("user-1", 3, 60);
    const result2 = rateLimiter.check("user-1", 3, 60);
    const result3 = rateLimiter.check("user-1", 3, 60);

    expect(result1.allowed).toBe(true);
    expect(result2.allowed).toBe(true);
    expect(result3.allowed).toBe(true);
  });

  it("should block requests exceeding limit", () => {
    rateLimiter.check("user-2", 2, 60);
    rateLimiter.check("user-2", 2, 60);
    const result = rateLimiter.check("user-2", 2, 60);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("should reset after window expires", () => {
    rateLimiter.check("user-3", 2, 60);
    rateLimiter.check("user-3", 2, 60);
    
    // Advance time by 61 seconds
    vi.advanceTimersByTime(61000);
    
    const result = rateLimiter.check("user-3", 2, 60);
    expect(result.allowed).toBe(true);
  });

  it("should handle different keys independently", () => {
    rateLimiter.check("user-4", 1, 60);
    const result1 = rateLimiter.check("user-4", 1, 60);
    const result2 = rateLimiter.check("user-5", 1, 60);

    expect(result1.allowed).toBe(false);
    expect(result2.allowed).toBe(true);
  });

  it("should provide correct retryAfter time", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    rateLimiter.check("user-6", 1, 60);
    const result = rateLimiter.check("user-6", 1, 60);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });
});
