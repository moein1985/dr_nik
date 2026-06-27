import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("fresh router - input validation", () => {
  const createPostInput = z.object({
    mediaType: z.enum(["IMAGE", "VIDEO"]),
    mediaUrl: z.string().min(1),
    caption: z.string().max(500).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  });

  const updatePostInput = z.object({
    id: z.string().uuid(),
    mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
    mediaUrl: z.string().min(1).optional(),
    caption: z.string().max(500).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  });

  const toggleLikeInput = z.object({
    postId: z.string().uuid(),
  });

  const addCommentInput = z.object({
    postId: z.string().uuid(),
    content: z.string().min(1).max(500),
  });

  const updateAvatarInput = z.object({
    avatarUrl: z.string().max(500),
  });

  it("accepts valid create post input with IMAGE type", () => {
    const result = createPostInput.parse({
      mediaType: "IMAGE",
      mediaUrl: "/uploads/2024-06-24/abc.jpg",
      caption: "Test caption",
      status: "PUBLISHED",
    });
    expect(result.mediaType).toBe("IMAGE");
  });

  it("accepts valid create post input with VIDEO type", () => {
    const result = createPostInput.parse({
      mediaType: "VIDEO",
      mediaUrl: "/uploads/2024-06-24/abc.mp4",
    });
    expect(result.mediaType).toBe("VIDEO");
  });

  it("rejects invalid mediaType", () => {
    expect(() =>
      createPostInput.parse({
        mediaType: "AUDIO",
        mediaUrl: "/uploads/test.mp3",
      }),
    ).toThrow();
  });

  it("rejects empty mediaUrl", () => {
    expect(() =>
      createPostInput.parse({
        mediaType: "IMAGE",
        mediaUrl: "",
      }),
    ).toThrow();
  });

  it("rejects caption longer than 500 chars", () => {
    expect(() =>
      createPostInput.parse({
        mediaType: "IMAGE",
        mediaUrl: "/uploads/test.jpg",
        caption: "a".repeat(501),
      }),
    ).toThrow();
  });

  it("accepts valid update post input with partial fields", () => {
    const result = updatePostInput.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      caption: "Updated caption",
    });
    expect(result.caption).toBe("Updated caption");
  });

  it("rejects update with invalid UUID", () => {
    expect(() =>
      updatePostInput.parse({
        id: "not-a-uuid",
        caption: "test",
      }),
    ).toThrow();
  });

  it("accepts valid toggleLike input", () => {
    const result = toggleLikeInput.parse({
      postId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.postId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects toggleLike with invalid UUID", () => {
    expect(() =>
      toggleLikeInput.parse({ postId: "invalid" }),
    ).toThrow();
  });

  it("accepts valid addComment input", () => {
    const result = addCommentInput.parse({
      postId: "550e8400-e29b-41d4-a716-446655440000",
      content: "Great post!",
    });
    expect(result.content).toBe("Great post!");
  });

  it("rejects empty comment content", () => {
    expect(() =>
      addCommentInput.parse({
        postId: "550e8400-e29b-41d4-a716-446655440000",
        content: "",
      }),
    ).toThrow();
  });

  it("rejects comment content longer than 500 chars", () => {
    expect(() =>
      addCommentInput.parse({
        postId: "550e8400-e29b-41d4-a716-446655440000",
        content: "a".repeat(501),
      }),
    ).toThrow();
  });

  it("accepts valid avatar URL", () => {
    const result = updateAvatarInput.parse({
      avatarUrl: "/uploads/2024-06-27/avatar.jpg",
    });
    expect(result.avatarUrl).toBe("/uploads/2024-06-27/avatar.jpg");
  });

  it("accepts empty avatar URL (for deletion)", () => {
    const result = updateAvatarInput.parse({
      avatarUrl: "",
    });
    expect(result.avatarUrl).toBe("");
  });

  it("rejects avatar URL longer than 500 chars", () => {
    expect(() =>
      updateAvatarInput.parse({
        avatarUrl: "a".repeat(501),
      }),
    ).toThrow();
  });
});
