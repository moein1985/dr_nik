import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoginLockoutService } from "../login-lockout.service";

describe("LoginLockoutService", () => {
  let service: LoginLockoutService;

  beforeEach(() => {
    service = new LoginLockoutService(3, 15); // 3 attempts, 15 minutes
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not lock account with fewer than max attempts", async () => {
    await service.recordFailedAttempt("user-1");
    await service.recordFailedAttempt("user-1");

    const isLocked = await service.isLocked("user-1");
    expect(isLocked).toBe(false);
  });

  it("should lock account after max failed attempts", async () => {
    await service.recordFailedAttempt("user-2");
    await service.recordFailedAttempt("user-2");
    await service.recordFailedAttempt("user-2");

    const isLocked = await service.isLocked("user-2");
    expect(isLocked).toBe(true);
  });

  it("should unlock account after lockout period", async () => {
    await service.recordFailedAttempt("user-3");
    await service.recordFailedAttempt("user-3");
    await service.recordFailedAttempt("user-3");

    expect(await service.isLocked("user-3")).toBe(true);

    // Advance time by 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000);

    expect(await service.isLocked("user-3")).toBe(false);
  });

  it("should reset attempts on successful login", async () => {
    await service.recordFailedAttempt("user-4");
    await service.recordFailedAttempt("user-4");
    
    await service.recordSuccessfulLogin("user-4");
    
    await service.recordFailedAttempt("user-4");
    const isLocked = await service.isLocked("user-4");
    
    expect(isLocked).toBe(false);
  });

  it("should handle multiple users independently", async () => {
    await service.recordFailedAttempt("user-5");
    await service.recordFailedAttempt("user-5");
    await service.recordFailedAttempt("user-5");

    await service.recordFailedAttempt("user-6");

    expect(await service.isLocked("user-5")).toBe(true);
    expect(await service.isLocked("user-6")).toBe(false);
  });
});
