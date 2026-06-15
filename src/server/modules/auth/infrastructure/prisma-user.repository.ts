import { Prisma, type PrismaClient, type User as PrismaUser, type UserRole as PrismaUserRole } from "@prisma/client";
import type { User, UserRole } from "../domain/user.entity";
import type { CreateUserInput, UserRepository } from "../domain/user.repository";

const toDomainUser = (user: PrismaUser): User => ({
  id: user.id,
  phoneNumber: user.phoneNumber ?? undefined,
  username: user.username ?? undefined,
  email: user.email ?? undefined,
  role: user.role as UserRole,
  passwordHash: user.passwordHash,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const isNotFoundError = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateUserInput): Promise<User> {
    if (!input.phoneNumber && !input.username) {
      throw new Error("Either phoneNumber or username must be provided");
    }

    const normalizedPhone = input.phoneNumber?.trim();
    const normalizedUsername = input.username?.trim();
    const normalizedEmail = input.email?.trim();

    if (normalizedPhone) {
      const duplicatePhone = await this.prisma.user.findUnique({
        where: { phoneNumber: normalizedPhone },
        select: { id: true },
      });

      if (duplicatePhone) {
        throw new Error("Phone number already exists");
      }
    }

    if (normalizedUsername) {
      const duplicateUsername = await this.prisma.user.findFirst({
        where: {
          username: {
            equals: normalizedUsername,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (duplicateUsername) {
        throw new Error("Username already exists");
      }
    }

    if (normalizedEmail) {
      const duplicateEmail = await this.prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (duplicateEmail) {
        throw new Error("Email already exists");
      }
    }

    const created = await this.prisma.user.create({
      data: {
        phoneNumber: normalizedPhone ?? null,
        username: normalizedUsername ?? null,
        email: normalizedEmail ?? null,
        role: input.role as PrismaUserRole,
        passwordHash: input.passwordHash,
        isActive: input.isActive ?? true,
      },
    });

    return toDomainUser(created);
  }

  async list(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    return users.map(toDomainUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toDomainUser(user) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber: phoneNumber.trim() },
    });

    return user ? toDomainUser(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username.trim(),
          mode: "insensitive",
        },
      },
    });

    return user ? toDomainUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: "insensitive",
        },
      },
    });

    return user ? toDomainUser(user) : null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error("User not found");
      }

      throw error;
    }
  }

  async updateIsActive(id: string, isActive: boolean): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive },
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error("User not found");
      }

      throw error;
    }
  }

  async updateRole(id: string, role: UserRole): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { role: role as PrismaUserRole },
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error("User not found");
      }

      throw error;
    }
  }
}
