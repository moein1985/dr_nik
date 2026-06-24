import { describe, it, expect, beforeEach, vi } from "vitest";
import { RegisterUseCase } from "../application/register.use-case";

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let mockUserRepo: any;
  let mockSessionRepo: any;
  let mockPasswordHasher: any;

  beforeEach(() => {
    mockUserRepo = {
      findByPhoneNumber: vi.fn(),
      findByUsername: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    mockSessionRepo = {
      create: vi.fn(),
    };
    mockPasswordHasher = {
      hash: vi.fn(),
    };

    useCase = new RegisterUseCase(
      mockUserRepo,
      mockSessionRepo,
      mockPasswordHasher,
    );
  });

  it("should register new user with phone number", async () => {
    const input = {
      phoneNumber: "1234567890",
      password: "password123",
    };

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

    mockUserRepo.findByPhoneNumber.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue("hashed");
    mockUserRepo.create.mockResolvedValue(mockUser);
    mockSessionRepo.create.mockResolvedValue(mockSession);

    const result = await useCase.execute(input);

    expect(mockUserRepo.findByPhoneNumber).toHaveBeenCalledWith("1234567890");
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith("password123");
    expect(mockUserRepo.create).toHaveBeenCalled();
    expect(result).toEqual(mockSession);
  });

  it("should throw error when phone number already exists", async () => {
    const input = {
      phoneNumber: "1234567890",
      password: "password123",
    };

    mockUserRepo.findByPhoneNumber.mockResolvedValue({ id: "existing-user" });

    await expect(useCase.execute(input)).rejects.toThrow("Phone number already registered");
    expect(mockUserRepo.create).not.toHaveBeenCalled();
  });

  it("should register user with username", async () => {
    const input = {
      username: "testuser",
      password: "password123",
    };

    const mockUser = {
      id: "user-2",
      username: "testuser",
      passwordHash: "hashed",
      role: "PATIENT" as const,
      isActive: true,
      createdAt: new Date(),
    };

    const mockSession = {
      id: "session-2",
      userId: "user-2",
      userRole: "PATIENT" as const,
      token: "token-456",
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    };

    mockUserRepo.findByUsername.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue("hashed");
    mockUserRepo.create.mockResolvedValue(mockUser);
    mockSessionRepo.create.mockResolvedValue(mockSession);

    const result = await useCase.execute(input);

    expect(mockUserRepo.findByUsername).toHaveBeenCalledWith("testuser");
    expect(result).toEqual(mockSession);
  });

  it("should throw error when username already exists", async () => {
    const input = {
      username: "testuser",
      password: "password123",
    };

    mockUserRepo.findByUsername.mockResolvedValue({ id: "existing-user" });

    await expect(useCase.execute(input)).rejects.toThrow("Username already taken");
    expect(mockUserRepo.create).not.toHaveBeenCalled();
  });
});
