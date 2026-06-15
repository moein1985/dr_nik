import { randomUUID } from "node:crypto";
import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { PublicUser } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export type LoginInput = {
  identifier: string;
  password: string;
};

export type LoginResult = {
  sessionToken: string;
  user: PublicUser;
};

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const trimmed = input.identifier.trim();
    const byPhone = await this.users.findByPhoneNumber(trimmed);
    const user = byPhone ?? (await this.users.findByUsername(trimmed));

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordOk = await this.passwordHasher.verify(input.password, user.passwordHash);

    if (!passwordOk) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    return {
      sessionToken: randomUUID(),
      user: toPublicUser(user),
    };
  }
}
