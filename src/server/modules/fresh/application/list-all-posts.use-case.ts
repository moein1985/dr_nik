import type { FreshRepository, FreshPost } from "../infrastructure/fresh.repository";

export class ListAllPostsUseCase {
  constructor(private repository: FreshRepository) {}

  async execute(limit?: number): Promise<FreshPost[]> {
    return this.repository.listAll(limit);
  }
}
