import type { FreshRepository, CreateFreshPostInput, FreshPost } from "../infrastructure/fresh.repository";

export class CreatePostUseCase {
  constructor(private repository: FreshRepository) {}

  async execute(input: CreateFreshPostInput): Promise<FreshPost> {
    return this.repository.create(input);
  }
}
