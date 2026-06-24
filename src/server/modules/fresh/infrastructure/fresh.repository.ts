import type { PrismaClient } from "@prisma/client";

export type FreshPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type FreshPost = {
  id: string;
  authorUserId: string;
  mediaType: string;
  mediaUrl: string;
  caption: string | null;
  status: string; // Prisma returns string for enums
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    likes: number;
    comments: number;
  };
};

export type FreshPostWithDetails = FreshPost & {
  author: {
    id: string;
    username: string | null;
  };
  likes: Array<{
    id: string;
    userId: string;
  }>;
  comments: Array<{
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    user: {
      username: string | null;
    };
  }>;
};

export type CreateFreshPostInput = {
  authorUserId: string;
  mediaType: string;
  mediaUrl: string;
  caption?: string;
  status?: string;
};

export type UpdateFreshPostInput = {
  id: string;
  mediaType?: string;
  mediaUrl?: string;
  caption?: string;
  status?: string;
};

export class FreshRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateFreshPostInput): Promise<FreshPost> {
    return this.prisma.freshPost.create({
      data: {
        authorUserId: input.authorUserId,
        mediaType: input.mediaType,
        mediaUrl: input.mediaUrl,
        caption: input.caption ?? null,
        status: (input.status ?? "PUBLISHED") as FreshPostStatus,
      },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async findById(id: string): Promise<FreshPostWithDetails | null> {
    return this.prisma.freshPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true },
        },
        likes: {
          select: { id: true, userId: true },
        },
        comments: {
          select: {
            id: true,
            userId: true,
            content: true,
            createdAt: true,
            user: {
              select: { username: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async listPublished(limit = 50): Promise<FreshPost[]> {
    return this.prisma.freshPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async listAll(limit = 50): Promise<FreshPost[]> {
    return this.prisma.freshPost.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async listByAuthor(authorUserId: string): Promise<FreshPost[]> {
    return this.prisma.freshPost.findMany({
      where: { authorUserId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async update(input: UpdateFreshPostInput): Promise<FreshPost> {
    const data: any = {};
    if (input.mediaType !== undefined) data.mediaType = input.mediaType;
    if (input.mediaUrl !== undefined) data.mediaUrl = input.mediaUrl;
    if (input.caption !== undefined) data.caption = input.caption;
    if (input.status !== undefined) data.status = input.status;

    return this.prisma.freshPost.update({
      where: { id: input.id },
      data,
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.freshPost.delete({ where: { id } });
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    const existing = await this.prisma.freshLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.freshLike.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await this.prisma.freshLike.create({
        data: { postId, userId },
      });
      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string): Promise<{ id: string }> {
    const comment = await this.prisma.freshComment.create({
      data: { postId, userId, content },
    });
    return { id: comment.id };
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.prisma.freshComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.userId !== userId) {
      throw new Error("Comment not found or unauthorized");
    }

    await this.prisma.freshComment.delete({ where: { id: commentId } });
  }

  async updateComment(commentId: string, data: { content: string }): Promise<{ id: string }> {
    const comment = await this.prisma.freshComment.update({
      where: { id: commentId },
      data,
    });
    return { id: comment.id };
  }

  async deleteCommentByAdmin(commentId: string): Promise<void> {
    await this.prisma.freshComment.delete({ where: { id: commentId } });
  }

  async listAllComments(filters: { postId?: string; userId?: string; limit: number }): Promise<Array<{
    id: string;
    content: string;
    userId: string;
    username: string | null;
    postId: string;
    postCaption: string | null;
    createdAt: Date;
  }>> {
    const where: any = {};
    if (filters.postId) where.postId = filters.postId;
    if (filters.userId) where.userId = filters.userId;

    const comments = await this.prisma.freshComment.findMany({
      where,
      take: filters.limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
        post: {
          select: { caption: true },
        },
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      username: comment.user.username,
      postId: comment.postId,
      postCaption: comment.post.caption,
      createdAt: comment.createdAt,
    }));
  }
}
