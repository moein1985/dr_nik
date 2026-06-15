import type { PublicUser } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<PublicUser[]> {
    const users = await this.users.list();
    return users.map(toPublicUser);
  }
}
