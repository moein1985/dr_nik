import { randomInt } from "node:crypto";
import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { PasswordResetRepository } from "../domain/password-reset.repository";
import type { SmsSenderPort } from "../domain/sms-sender.port";
import type { UserRepository } from "../domain/user.repository";

export type ForgotPasswordInput = {
  phoneNumber: string;
};

export class ForgotPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly resetRepository: PasswordResetRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly smsSender: SmsSenderPort,
    private readonly otpTtlMinutes: number,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<{ accepted: true }> {
    const user = await this.users.findByPhoneNumber(input.phoneNumber);

    // Prevent account enumeration in API responses.
    if (!user) {
      return { accepted: true };
    }

    const otpCode = String(randomInt(100000, 1000000));
    const otpCodeHash = await this.passwordHasher.hash(otpCode);
    const expiresAt = new Date(Date.now() + this.otpTtlMinutes * 60_000);

    await this.resetRepository.create({
      userId: user.id,
      otpCodeHash,
      expiresAt,
    });

    await this.smsSender.sendOtp(input.phoneNumber, otpCode);

    return { accepted: true };
  }
}
