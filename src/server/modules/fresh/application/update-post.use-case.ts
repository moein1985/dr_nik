import type { FreshRepository, UpdateFreshPostInput, FreshPost } from "../infrastructure/fresh.repository";

export class UpdatePostUseCase {
  constructor(private repository: FreshRepository) {}

  async execute(input: UpdateFreshPostInput): Promise<FreshPost> {
    return this.repository.update(input);
  }
}
