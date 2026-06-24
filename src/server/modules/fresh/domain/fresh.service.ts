import type { PrismaClient } from "@prisma/client";
import { FreshRepository } from "../infrastructure/fresh.repository";
import { CreatePostUseCase } from "../application/create-post.use-case";
import { ListPostsUseCase } from "../application/list-posts.use-case";
import { GetPostDetailsUseCase } from "../application/get-post-details.use-case";
import { UpdatePostUseCase } from "../application/update-post.use-case";
import { DeletePostUseCase } from "../application/delete-post.use-case";
import { ToggleLikeUseCase } from "../application/toggle-like.use-case";
import { AddCommentUseCase } from "../application/add-comment.use-case";

export class FreshService {
  public readonly createPost: CreatePostUseCase;
  public readonly listPosts: ListPostsUseCase;
  public readonly getPostDetails: GetPostDetailsUseCase;
  public readonly updatePost: UpdatePostUseCase;
  public readonly deletePost: DeletePostUseCase;
  public readonly toggleLike: ToggleLikeUseCase;
  public readonly addComment: AddCommentUseCase;

  constructor(prisma: PrismaClient) {
    const repository = new FreshRepository(prisma);
    this.createPost = new CreatePostUseCase(repository);
    this.listPosts = new ListPostsUseCase(repository);
    this.getPostDetails = new GetPostDetailsUseCase(repository);
    this.updatePost = new UpdatePostUseCase(repository);
    this.deletePost = new DeletePostUseCase(repository);
    this.toggleLike = new ToggleLikeUseCase(repository);
    this.addComment = new AddCommentUseCase(repository);
  }
}
