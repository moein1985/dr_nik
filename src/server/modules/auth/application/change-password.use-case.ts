import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { UserRepository } from "../domain/user.repository";

export type ChangePasswordInput = {
  userId: string;
  currentPassword: string;
  newPassword: string;
};

export class ChangePasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.users.findById(input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentPasswordOk = await this.passwordHasher.verify(
      input.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordOk) {
      throw new Error("Current password is incorrect");
    }

    const newPasswordHash = await this.passwordHasher.hash(input.newPassword);
    await this.users.updatePassword(input.userId, newPasswordHash);
  }
}
