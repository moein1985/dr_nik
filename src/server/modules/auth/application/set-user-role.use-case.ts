import type { PublicUser, UserRole } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export type SetUserRoleInput = {
  userId: string;
  role: UserRole;
};

export class SetUserRoleUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: SetUserRoleInput): Promise<PublicUser> {
    await this.users.updateRole(input.userId, input.role);

    const updated = await this.users.findById(input.userId);

    if (!updated) {
      throw new Error("User not found");
    }

    return toPublicUser(updated);
  }
}
