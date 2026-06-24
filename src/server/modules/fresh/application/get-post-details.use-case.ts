import type { FreshRepository, FreshPostWithDetails } from "../infrastructure/fresh.repository";

export class GetPostDetailsUseCase {
  constructor(private repository: FreshRepository) {}

  async execute(postId: string): Promise<FreshPostWithDetails | null> {
    return this.repository.findById(postId);
  }
}
