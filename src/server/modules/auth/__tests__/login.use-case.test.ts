import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoginUseCase } from "../application/login.use-case";
import type { UserRepository } from "../infrastructure/prisma-user.repository";
import type { SessionRepository } from "../infrastructure/prisma-session.repository";
import type { PasswordHasher } from "../domain/password-hasher.interface";

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let mockUserRepo: any;
  let mockSessionRepo: any;
  let mockPasswordHasher: any;
  let mockLoginLockout: any;

  beforeEach(() => {
    mockUserRepo = {
      findByPhoneNumber: vi.fn(),
      findByUsername: vi.fn(),
      findByEmail: vi.fn(),
    };
    mockSessionRepo = {
      create: vi.fn(),
    };
    mockPasswordHasher = {
      verify: vi.fn(),
    };
    mockLoginLockout = {
      isLocked: vi.fn(),
      recordFailedAttempt: vi.fn(),
      recordSuccessfulLogin: vi.fn(),
    };

    useCase = new LoginUseCase(
      mockUserRepo as unknown as UserRepository,
      mockSessionRepo as unknown as SessionRepository,
      mockPasswordHasher as unknown as PasswordHasher,
      mockLoginLockout,
    );
  });

  it("should login successfully with phone number", async () => {
    const mockUser = {
      id: "user-1",
      phoneNumber: "1234567890",
      passwordHash: "hashed",
      role: "PATIENT" as const,
      isActive: true,
      createdAt: new Date(),
    };

    const mockSession = {
      id: "session-1",
      userId: "user-1",
      userRole: "PATIENT" as const,
      token: "token-123",
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    };

    mockLoginLockout.isLocked.mockResolvedValue(false);
    mockUserRepo.findByPhoneNumber.mockResolvedValue(mockUser);
    mockPasswordHasher.verify.mockResolvedValue(true);
    mockSessionRepo.create.mockResolvedValue(mockSession);

    const result = await useCase.execute({
      identifier: "1234567890",
      password: "password123",
    });

    expect(result).toEqual(mockSession);
    expect(mockLoginLockout.recordSuccessfulLogin).toHaveBeenCalledWith("1234567890");
  });

  it("should throw error when account is locked", async () => {
    mockLoginLockout.isLocked.mockResolvedValue(true);

    await expect(
      useCase.execute({
        identifier: "1234567890",
        password: "password123",
      }),
    ).rejects.toThrow("Account temporarily locked");
  });

  it("should throw error when user not found", async () => {
    mockLoginLockout.isLocked.mockResolvedValue(false);
    mockUserRepo.findByPhoneNumber.mockResolvedValue(null);
    mockUserRepo.findByUsername.mockResolvedValue(null);
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        identifier: "nonexistent",
        password: "password123",
      }),
    ).rejects.toThrow("Invalid credentials");

    expect(mockLoginLockout.recordFailedAttempt).toHaveBeenCalledWith("nonexistent");
  });

  it("should throw error when password is invalid", async () => {
    const mockUser = {
      id: "user-1",
      phoneNumber: "1234567890",
      passwordHash: "hashed",
      role: "PATIENT" as const,
      isActive: true,
      createdAt: new Date(),
    };

    mockLoginLockout.isLocked.mockResolvedValue(false);
    mockUserRepo.findByPhoneNumber.mockResolvedValue(mockUser);
    mockPasswordHasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute({
        identifier: "1234567890",
        password: "wrongpassword",
      }),
    ).rejects.toThrow("Invalid credentials");

    expect(mockLoginLockout.recordFailedAttempt).toHaveBeenCalledWith("1234567890");
  });

  it("should throw error when user is inactive", async () => {
    const mockUser = {
      id: "user-1",
      phoneNumber: "1234567890",
      passwordHash: "hashed",
      role: "PATIENT" as const,
      isActive: false,
      createdAt: new Date(),
    };

    mockLoginLockout.isLocked.mockResolvedValue(false);
    mockUserRepo.findByPhoneNumber.mockResolvedValue(mockUser);
    mockPasswordHasher.verify.mockResolvedValue(true);

    await expect(
      useCase.execute({
        identifier: "1234567890",
        password: "password123",
      }),
    ).rejects.toThrow("Account is inactive");
  });
});
