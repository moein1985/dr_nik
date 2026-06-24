import type { FreshRepository } from "../infrastructure/fresh.repository";

export class ToggleLikeUseCase {
  constructor(private repository: FreshRepository) {}

  async execute(postId: string, userId: string): Promise<{ liked: boolean }> {
    return this.repository.toggleLike(postId, userId);
  }
}
