import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { PublicUser } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export type EnsureDefaultStaffInput = {
  username: string;
  email: string;
  password: string;
};

export class EnsureDefaultStaffUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: EnsureDefaultStaffInput): Promise<PublicUser> {
    const existing = await this.users.findByUsername(input.username);

    if (existing) {
      return toPublicUser(existing);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const staff = await this.users.create({
      username: input.username,
      email: input.email,
      role: "STAFF",
      passwordHash,
      isActive: true,
    });

    return toPublicUser(staff);
  }
}
