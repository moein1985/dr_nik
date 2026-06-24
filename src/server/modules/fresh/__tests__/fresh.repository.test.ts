import { describe, it, expect, beforeEach, vi } from "vitest";
import { FreshRepository } from "../infrastructure/fresh.repository";
import type { PrismaClient } from "@prisma/client";

describe("FreshRepository", () => {
  let repository: FreshRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      freshPost: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      freshLike: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      freshComment: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    };
    repository = new FreshRepository(mockPrisma as unknown as PrismaClient);
  });

  describe("create", () => {
    it("should create a new post", async () => {
      const input = {
        authorUserId: "user-1",
        mediaType: "IMAGE",
        mediaUrl: "https://example.com/image.jpg",
        caption: "Test caption",
      };

      const mockPost = {
        id: "post-1",
        ...input,
        status: "PUBLISHED",
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { likes: 0, comments: 0 },
      };

      mockPrisma.freshPost.create.mockResolvedValue(mockPost);

      const result = await repository.create(input);

      expect(result).toEqual(mockPost);
      expect(mockPrisma.freshPost.create).toHaveBeenCalledWith({
        data: {
          authorUserId: input.authorUserId,
          mediaType: input.mediaType,
          mediaUrl: input.mediaUrl,
          caption: input.caption,
          status: "PUBLISHED",
        },
        include: {
          _count: {
            select: { likes: true, comments: true },
          },
        },
      });
    });
  });

  describe("findById", () => {
    it("should find a post by id with details", async () => {
      const mockPost = {
        id: "post-1",
        authorUserId: "user-1",
        mediaType: "IMAGE",
        mediaUrl: "https://example.com/image.jpg",
        caption: "Test",
        status: "PUBLISHED",
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: "user-1", username: "testuser" },
        likes: [],
        comments: [],
        _count: { likes: 0, comments: 0 },
      };

      mockPrisma.freshPost.findUnique.mockResolvedValue(mockPost);

      const result = await repository.findById("post-1");

      expect(result).toEqual(mockPost);
      expect(mockPrisma.freshPost.findUnique).toHaveBeenCalledWith({
        where: { id: "post-1" },
        include: expect.any(Object),
      });
    });
  });

  describe("listPublished", () => {
    it("should list published posts", async () => {
      const mockPosts = [
        {
          id: "post-1",
          status: "PUBLISHED",
          createdAt: new Date(),
          _count: { likes: 5, comments: 3 },
        },
      ];

      mockPrisma.freshPost.findMany.mockResolvedValue(mockPosts);

      const result = await repository.listPublished(10);

      expect(result).toEqual(mockPosts);
      expect(mockPrisma.freshPost.findMany).toHaveBeenCalledWith({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          _count: {
            select: { likes: true, comments: true },
          },
        },
      });
    });
  });

  describe("toggleLike", () => {
    it("should add like if not exists", async () => {
      mockPrisma.freshLike.findUnique.mockResolvedValue(null);
      mockPrisma.freshLike.create.mockResolvedValue({ id: "like-1" });

      const result = await repository.toggleLike("post-1", "user-1");

      expect(result.liked).toBe(true);
      expect(mockPrisma.freshLike.create).toHaveBeenCalled();
    });

    it("should remove like if exists", async () => {
      mockPrisma.freshLike.findUnique.mockResolvedValue({ id: "like-1" });
      mockPrisma.freshLike.delete.mockResolvedValue({ id: "like-1" });

      const result = await repository.toggleLike("post-1", "user-1");

      expect(result.liked).toBe(false);
      expect(mockPrisma.freshLike.delete).toHaveBeenCalled();
    });
  });

  describe("addComment", () => {
    it("should add a comment to a post", async () => {
      const mockComment = {
        id: "comment-1",
        postId: "post-1",
        userId: "user-1",
        content: "Great post!",
        createdAt: new Date(),
      };

      mockPrisma.freshComment.create.mockResolvedValue(mockComment);

      const result = await repository.addComment("post-1", "user-1", "Great post!");

      expect(result.id).toBe("comment-1");
      expect(mockPrisma.freshComment.create).toHaveBeenCalledWith({
        data: {
          postId: "post-1",
          userId: "user-1",
          content: "Great post!",
        },
      });
    });
  });
});
