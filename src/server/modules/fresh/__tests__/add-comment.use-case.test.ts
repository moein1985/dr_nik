import { describe, it, expect, beforeEach, vi } from "vitest";
import { AddCommentUseCase } from "../application/add-comment.use-case";
import type { FreshRepository } from "../infrastructure/fresh.repository";

describe("AddCommentUseCase", () => {
  let useCase: AddCommentUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      addComment: vi.fn(),
    };

    useCase = new AddCommentUseCase(mockRepository as unknown as FreshRepository);
  });

  it("should add comment successfully", async () => {
    const mockComment = { id: "comment-1" };
    mockRepository.addComment.mockResolvedValue(mockComment);

    const result = await useCase.execute("post-1", "user-1", "Great post!");

    expect(mockRepository.addComment).toHaveBeenCalledWith("post-1", "user-1", "Great post!");
    expect(result).toEqual(mockComment);
  });

  it("should handle long comments", async () => {
    const longComment = "A".repeat(500);
    const mockComment = { id: "comment-2" };
    mockRepository.addComment.mockResolvedValue(mockComment);

    const result = await useCase.execute("post-1", "user-1", longComment);

    expect(mockRepository.addComment).toHaveBeenCalledWith("post-1", "user-1", longComment);
    expect(result).toEqual(mockComment);
  });
});
