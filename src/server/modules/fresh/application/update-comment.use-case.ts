import type { FreshRepository } from "../infrastructure/fresh.repository";

export class UpdateCommentUseCase {
  constructor(private readonly comments: FreshRepository) {}

  async execute(commentId: string, content: string) {
    return this.comments.updateComment(commentId, { content });
  }
}
