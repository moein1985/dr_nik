import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { PublicUser } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export type EnsureDefaultSuperAdminInput = {
  username: string;
  password: string;
};

export class EnsureDefaultSuperAdminUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: EnsureDefaultSuperAdminInput): Promise<PublicUser> {
    const existing = await this.users.findByUsername(input.username);

    if (existing) {
      return toPublicUser(existing);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const superAdmin = await this.users.create({
      username: input.username,
      role: "SUPER_ADMIN",
      passwordHash,
      isActive: true,
    });

    return toPublicUser(superAdmin);
  }
}
