import { randomUUID } from "node:crypto";
import type { User, UserRole } from "../domain/user.entity";
import type { CreateUserInput, UserRepository } from "../domain/user.repository";

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async create(input: CreateUserInput): Promise<User> {
    if (!input.phoneNumber && !input.username) {
      throw new Error("Either phoneNumber or username must be provided");
    }

    if (input.phoneNumber) {
      const duplicatePhone = this.users.some((user) => user.phoneNumber === input.phoneNumber);
      if (duplicatePhone) {
        throw new Error("Phone number already exists");
      }
    }

    if (input.username) {
      const normalized = input.username.trim().toLowerCase();
      const duplicateUsername = this.users.some(
        (user) => (user.username ?? "").trim().toLowerCase() === normalized,
      );

      if (duplicateUsername) {
        throw new Error("Username already exists");
      }
    }

    if (input.email) {
      const normalizedEmail = input.email.trim().toLowerCase();
      const duplicateEmail = this.users.some(
        (user) => (user.email ?? "").trim().toLowerCase() === normalizedEmail,
      );

      if (duplicateEmail) {
        throw new Error("Email already exists");
      }
    }

    const user: User = {
      id: randomUUID(),
      phoneNumber: input.phoneNumber,
      username: input.username,
      email: input.email,
      role: input.role,
      passwordHash: input.passwordHash,
      isActive: input.isActive ?? true,
      createdAt: new Date(),
    };

    this.users.push(user);

    return user;
  }

  async list(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const normalized = phoneNumber.trim();
    return this.users.find((user) => user.phoneNumber === normalized) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const normalized = username.trim().toLowerCase();
    return (
      this.users.find((user) => (user.username ?? "").trim().toLowerCase() === normalized) ?? null
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    return (
      this.users.find((user) => (user.email ?? "").trim().toLowerCase() === normalized) ?? null
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const target = this.users.find((user) => user.id === id);

    if (!target) {
      throw new Error("User not found");
    }

    target.passwordHash = passwordHash;
  }

  async updateIsActive(id: string, isActive: boolean): Promise<void> {
    const target = this.users.find((user) => user.id === id);

    if (!target) {
      throw new Error("User not found");
    }

    target.isActive = isActive;
  }

  async updateRole(id: string, role: UserRole): Promise<void> {
    const target = this.users.find((user) => user.id === id);

    if (!target) {
      throw new Error("User not found");
    }

    target.role = role;
  }
}
