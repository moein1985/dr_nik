import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreatePostUseCase } from "../application/create-post.use-case";
import type { FreshRepository } from "../infrastructure/fresh.repository";

describe("CreatePostUseCase", () => {
  let useCase: CreatePostUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
    };

    useCase = new CreatePostUseCase(mockRepository as unknown as FreshRepository);
  });

  it("should create a post successfully", async () => {
    const input = {
      authorUserId: "user-1",
      mediaType: "IMAGE",
      mediaUrl: "https://example.com/image.jpg",
      caption: "Test caption",
      status: "PUBLISHED",
    };

    const mockPost = {
      id: "post-1",
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { likes: 0, comments: 0 },
    };

    mockRepository.create.mockResolvedValue(mockPost);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockPost);
  });

  it("should create a draft post", async () => {
    const input = {
      authorUserId: "user-1",
      mediaType: "VIDEO",
      mediaUrl: "https://example.com/video.mp4",
      status: "DRAFT",
    };

    const mockPost = {
      id: "post-2",
      ...input,
      caption: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { likes: 0, comments: 0 },
    };

    mockRepository.create.mockResolvedValue(mockPost);

    const result = await useCase.execute(input);

    expect(result.status).toBe("DRAFT");
    expect(result.caption).toBeNull();
  });
});
