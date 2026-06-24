import type { FreshRepository } from "../infrastructure/fresh.repository";

export class AddCommentUseCase {
  constructor(private repository: FreshRepository) {}

  async execute(postId: string, userId: string, content: string): Promise<{ id: string }> {
    return this.repository.addComment(postId, userId, content);
  }
}
