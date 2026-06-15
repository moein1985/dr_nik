import type { PasswordResetRequest } from "./password-reset.entity";

export type CreatePasswordResetRequestInput = {
  userId: string;
  otpCodeHash: string;
  expiresAt: Date;
};

export interface PasswordResetRepository {
  create(input: CreatePasswordResetRequestInput): Promise<PasswordResetRequest>;
  findLatestActiveByUserId(userId: string): Promise<PasswordResetRequest | null>;
  markConsumed(id: string): Promise<void>;
}
