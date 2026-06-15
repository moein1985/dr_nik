import { randomUUID } from "node:crypto";
import type { PasswordResetRequest } from "../domain/password-reset.entity";
import type {
  CreatePasswordResetRequestInput,
  PasswordResetRepository,
} from "../domain/password-reset.repository";

export class InMemoryPasswordResetRepository implements PasswordResetRepository {
  private readonly requests: PasswordResetRequest[] = [];

  async create(input: CreatePasswordResetRequestInput): Promise<PasswordResetRequest> {
    const request: PasswordResetRequest = {
      id: randomUUID(),
      userId: input.userId,
      otpCodeHash: input.otpCodeHash,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
    };

    this.requests.push(request);
    return request;
  }

  async findLatestActiveByUserId(userId: string): Promise<PasswordResetRequest | null> {
    const active = this.requests
      .filter((request) => request.userId === userId && !request.consumedAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return active[0] ?? null;
  }

  async markConsumed(id: string): Promise<void> {
    const target = this.requests.find((request) => request.id === id);

    if (!target) {
      throw new Error("Reset request not found");
    }

    target.consumedAt = new Date();
  }
}
