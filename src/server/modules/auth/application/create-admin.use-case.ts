import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { PublicUser } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export type CreateAdminInput = {
  username: string;
  email: string;
  password: string;
  role?: "ADMIN" | "CONTENT_MANAGER" | "STAFF" | "DOCTOR";
};

export class CreateAdminUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: CreateAdminInput): Promise<PublicUser> {
    const exists = await this.users.findByUsername(input.username);

    if (exists) {
      throw new Error("A user with this username already exists");
    }

    const emailExists = await this.users.findByEmail(input.email);

    if (emailExists) {
      throw new Error("A user with this email already exists");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({
      username: input.username,
      email: input.email,
      role: input.role || "DOCTOR",
      passwordHash,
      isActive: true,
    });

    return toPublicUser(user);
  }
}
