import type { PublicUser } from "@/server/modules/auth/domain/user.entity";
import { toPublicUser } from "@/server/modules/auth/domain/user.entity";
import type { UserRepository } from "@/server/modules/auth/domain/user.repository";

export class ListAssignableStaffUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<PublicUser[]> {
    const users = await this.users.list();
    return users
      .filter((user) => user.role === "STAFF" && user.isActive)
      .map(toPublicUser);
  }
}
