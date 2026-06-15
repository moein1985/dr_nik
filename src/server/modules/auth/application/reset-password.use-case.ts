import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { PasswordResetRepository } from "../domain/password-reset.repository";
import type { UserRepository } from "../domain/user.repository";

export type ResetPasswordInput = {
  phoneNumber: string;
  otpCode: string;
  newPassword: string;
};

export class ResetPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly resetRepository: PasswordResetRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: ResetPasswordInput): Promise<{ updated: true }> {
    const user = await this.users.findByPhoneNumber(input.phoneNumber);

    if (!user) {
      throw new Error("Invalid reset request");
    }

    const request = await this.resetRepository.findLatestActiveByUserId(user.id);

    if (!request) {
      throw new Error("Invalid or expired OTP");
    }

    if (request.expiresAt.getTime() < Date.now()) {
      throw new Error("OTP expired");
    }

    const otpValid = await this.passwordHasher.verify(input.otpCode, request.otpCodeHash);

    if (!otpValid) {
      throw new Error("Invalid or expired OTP");
    }

    const newPasswordHash = await this.passwordHasher.hash(input.newPassword);
    await this.users.updatePassword(user.id, newPasswordHash);
    await this.resetRepository.markConsumed(request.id);

    return { updated: true };
  }
}
