import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
    service.registerFailure("user-1");
    service.registerFailure("user-1");

    const isLocked = service.getRemainingLockSeconds("user-1") > 0;
    expect(isLocked).toBe(false);
  });

  it("should lock account after max failed attempts", async () => {
    service.registerFailure("user-2");
    service.registerFailure("user-2");
    service.registerFailure("user-2");

    const isLocked = service.getRemainingLockSeconds("user-2") > 0;
    expect(isLocked).toBe(true);
  });

  it("should unlock account after lockout period", async () => {
    service.registerFailure("user-3");
    service.registerFailure("user-3");
    service.registerFailure("user-3");

    expect(service.getRemainingLockSeconds("user-3") > 0).toBe(true);

    // Advance time by 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000);

    expect(service.getRemainingLockSeconds("user-3") > 0).toBe(false);
  });

  it("should reset attempts on successful login", async () => {
    service.registerFailure("user-4");
    service.registerFailure("user-4");
    
    service.registerSuccess("user-4");
    
    service.registerFailure("user-4");
    const isLocked = service.getRemainingLockSeconds("user-4") > 0;
    
    expect(isLocked).toBe(false);
  });

  it("should handle multiple users independently", async () => {
    service.registerFailure("user-5");
    service.registerFailure("user-5");
    service.registerFailure("user-5");

    service.registerFailure("user-6");

    expect(service.getRemainingLockSeconds("user-5") > 0).toBe(true);
    expect(service.getRemainingLockSeconds("user-6") > 0).toBe(false);
  });
});
