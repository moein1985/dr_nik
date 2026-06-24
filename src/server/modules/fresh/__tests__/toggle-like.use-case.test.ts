import { describe, it, expect, beforeEach, vi } from "vitest";
import { ToggleLikeUseCase } from "../application/toggle-like.use-case";
import type { FreshRepository } from "../infrastructure/fresh.repository";

describe("ToggleLikeUseCase", () => {
  let useCase: ToggleLikeUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      toggleLike: vi.fn(),
    };

    useCase = new ToggleLikeUseCase(mockRepository as unknown as FreshRepository);
  });

  it("should add like when not exists", async () => {
    mockRepository.toggleLike.mockResolvedValue({ liked: true });

    const result = await useCase.execute("post-1", "user-1");

    expect(mockRepository.toggleLike).toHaveBeenCalledWith("post-1", "user-1");
    expect(result.liked).toBe(true);
  });

  it("should remove like when exists", async () => {
    mockRepository.toggleLike.mockResolvedValue({ liked: false });

    const result = await useCase.execute("post-1", "user-1");

    expect(mockRepository.toggleLike).toHaveBeenCalledWith("post-1", "user-1");
    expect(result.liked).toBe(false);
  });
});
