type LockoutEntry = {
  failedAttempts: number;
  lockUntil?: number;
};

export class LoginLockoutService {
  private readonly entries = new Map<string, LockoutEntry>();

  constructor(
    private readonly maxAttempts: number,
    private readonly lockMinutes: number,
  ) {}

  getRemainingLockSeconds(identifier: string): number {
    const key = this.normalize(identifier);
    const entry = this.entries.get(key);

    if (!entry?.lockUntil) {
      return 0;
    }

    const remainingMs = entry.lockUntil - Date.now();
    if (remainingMs <= 0) {
      entry.lockUntil = undefined;
      this.entries.set(key, entry);
      return 0;
    }

    return Math.ceil(remainingMs / 1000);
  }

  registerFailure(identifier: string): number {
    const key = this.normalize(identifier);
    const now = Date.now();
    const entry = this.entries.get(key) ?? { failedAttempts: 0 };

    if (entry.lockUntil && entry.lockUntil > now) {
      return Math.ceil((entry.lockUntil - now) / 1000);
    }

    if (entry.lockUntil && entry.lockUntil <= now) {
      entry.lockUntil = undefined;
      entry.failedAttempts = 0;
    }

    entry.failedAttempts += 1;

    if (entry.failedAttempts >= this.maxAttempts) {
      entry.failedAttempts = 0;
      entry.lockUntil = now + this.lockMinutes * 60 * 1000;
    }

    this.entries.set(key, entry);
    return this.getRemainingLockSeconds(key);
  }

  registerSuccess(identifier: string): void {
    const key = this.normalize(identifier);
    this.entries.delete(key);
  }

  private normalize(value: string) {
    return value.trim().toLowerCase();
  }
}
