import type { PublicUser } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export type SetUserActiveInput = {
  userId: string;
  isActive: boolean;
};

export class SetUserActiveUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: SetUserActiveInput): Promise<PublicUser> {
    await this.users.updateIsActive(input.userId, input.isActive);

    const updated = await this.users.findById(input.userId);

    if (!updated) {
      throw new Error("User not found");
    }

    return toPublicUser(updated);
  }
}
