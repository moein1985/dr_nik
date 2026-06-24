import type { FreshRepository } from "../infrastructure/fresh.repository";

export class DeleteCommentUseCase {
  constructor(private readonly comments: FreshRepository) {}

  async execute(commentId: string) {
    return this.comments.deleteCommentByAdmin(commentId);
  }
}
