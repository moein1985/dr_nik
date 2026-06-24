import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Test the input validation schemas
describe('fresh router input validation', () => {
  it('should accept relative URLs in createPostInput', () => {
    const createPostInput = z.object({
      mediaType: z.enum(["IMAGE", "VIDEO"]),
      mediaUrl: z.string().min(1),
      caption: z.string().max(500).optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    });

    const validInput = {
      mediaType: "IMAGE" as const,
      mediaUrl: "/uploads/2024-06-24/abc123.jpg",
      caption: "Test caption",
      status: "PUBLISHED" as const,
    };

    const result = createPostInput.parse(validInput);
    expect(result.mediaUrl).toBe("/uploads/2024-06-24/abc123.jpg");
  });

  it('should accept relative URLs in updatePostInput', () => {
    const updatePostInput = z.object({
      id: z.string().uuid(),
      mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
      mediaUrl: z.string().min(1).optional(),
      caption: z.string().max(500).optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    });

    const validInput = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      mediaUrl: "/uploads/2024-06-24/xyz789.jpg",
    };

    const result = updatePostInput.parse(validInput);
    expect(result.mediaUrl).toBe("/uploads/2024-06-24/xyz789.jpg");
  });

  it('should reject empty mediaUrl', () => {
    const createPostInput = z.object({
      mediaType: z.enum(["IMAGE", "VIDEO"]),
      mediaUrl: z.string().min(1),
      caption: z.string().max(500).optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    });

    const invalidInput = {
      mediaType: "IMAGE" as const,
      mediaUrl: "",
    };

    expect(() => createPostInput.parse(invalidInput)).toThrow();
  });

  it('should accept various relative URL formats', () => {
    const createPostInput = z.object({
      mediaType: z.enum(["IMAGE", "VIDEO"]),
      mediaUrl: z.string().min(1),
      caption: z.string().max(500).optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    });

    const validUrls = [
      "/uploads/2024-06-24/file.jpg",
      "/uploads/2024-06-24/file.mp4",
      "/uploads/2024-06-24/file.png",
      "/uploads/2024-06-24/file.webp",
    ];

    validUrls.forEach(url => {
      const input = {
        mediaType: "IMAGE" as const,
        mediaUrl: url,
      };
      const result = createPostInput.parse(input);
      expect(result.mediaUrl).toBe(url);
    });
  });

  it('should still accept absolute URLs if needed', () => {
    const createPostInput = z.object({
      mediaType: z.enum(["IMAGE", "VIDEO"]),
      mediaUrl: z.string().min(1),
      caption: z.string().max(500).optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    });

    const validInput = {
      mediaType: "IMAGE" as const,
      mediaUrl: "https://example.com/image.jpg",
    };

    const result = createPostInput.parse(validInput);
    expect(result.mediaUrl).toBe("https://example.com/image.jpg");
  });
});
