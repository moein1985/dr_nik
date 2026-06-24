import type { FreshRepository } from "../infrastructure/fresh.repository";

export class ListAllCommentsUseCase {
  constructor(private readonly comments: FreshRepository) {}

  async execute(filters: { postId?: string; userId?: string; limit: number }) {
    return this.comments.listAllComments(filters);
  }
}
