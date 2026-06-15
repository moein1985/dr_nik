import { Prisma, type PasswordReset as PrismaPasswordReset, type PrismaClient } from "@prisma/client";
import type { PasswordResetRequest } from "../domain/password-reset.entity";
import type {
  CreatePasswordResetRequestInput,
  PasswordResetRepository,
} from "../domain/password-reset.repository";

const toDomainPasswordReset = (request: PrismaPasswordReset): PasswordResetRequest => ({
  id: request.id,
  userId: request.userId,
  otpCodeHash: request.otpCodeHash,
  expiresAt: request.expiresAt,
  consumedAt: request.consumedAt ?? undefined,
  createdAt: request.createdAt,
});

const isNotFoundError = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreatePasswordResetRequestInput): Promise<PasswordResetRequest> {
    const created = await this.prisma.passwordReset.create({
      data: {
        userId: input.userId,
        otpCodeHash: input.otpCodeHash,
        expiresAt: input.expiresAt,
      },
    });

    return toDomainPasswordReset(created);
  }

  async findLatestActiveByUserId(userId: string): Promise<PasswordResetRequest | null> {
    const request = await this.prisma.passwordReset.findFirst({
      where: {
        userId,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return request ? toDomainPasswordReset(request) : null;
  }

  async markConsumed(id: string): Promise<void> {
    try {
      await this.prisma.passwordReset.update({
        where: { id },
        data: {
          consumedAt: new Date(),
        },
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error("Reset request not found");
      }

      throw error;
    }
  }
}
