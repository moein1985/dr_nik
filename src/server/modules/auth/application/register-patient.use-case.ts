import type { PasswordHasherPort } from "../domain/password-hasher.port";
import type { PublicUser } from "../domain/user.entity";
import { toPublicUser } from "../domain/user.entity";
import type { UserRepository } from "../domain/user.repository";

export type RegisterPatientInput = {
  phoneNumber: string;
  password: string;
};

export class RegisterPatientUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: RegisterPatientInput): Promise<PublicUser> {
    const exists = await this.users.findByPhoneNumber(input.phoneNumber);

    if (exists) {
      throw new Error("A user with this phone number already exists");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.users.create({
      phoneNumber: input.phoneNumber,
      role: "PATIENT",
      passwordHash,
      isActive: true,
    });

    return toPublicUser(user);
  }
}
