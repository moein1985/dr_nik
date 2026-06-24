import type { FreshRepository } from "../infrastructure/fresh.repository";

export class DeletePostUseCase {
  constructor(private repository: FreshRepository) {}

  async execute(postId: string): Promise<void> {
    await this.repository.delete(postId);
  }
}
