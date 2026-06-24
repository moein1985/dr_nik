import type { PrismaClient } from "@prisma/client";
import { FreshRepository } from "../infrastructure/fresh.repository";
import { CreatePostUseCase } from "../application/create-post.use-case";
import { ListPostsUseCase } from "../application/list-posts.use-case";
import { ListAllPostsUseCase } from "../application/list-all-posts.use-case";
import { GetPostDetailsUseCase } from "../application/get-post-details.use-case";
import { UpdatePostUseCase } from "../application/update-post.use-case";
import { DeletePostUseCase } from "../application/delete-post.use-case";
import { ToggleLikeUseCase } from "../application/toggle-like.use-case";
import { AddCommentUseCase } from "../application/add-comment.use-case";
import { UpdateCommentUseCase } from "../application/update-comment.use-case";
import { DeleteCommentUseCase } from "../application/delete-comment.use-case";
import { ListAllCommentsUseCase } from "../application/list-all-comments.use-case";

export class FreshService {
  public readonly createPost: CreatePostUseCase;
  public readonly listPosts: ListPostsUseCase;
  public readonly listAllPosts: ListAllPostsUseCase;
  public readonly getPostDetails: GetPostDetailsUseCase;
  public readonly updatePost: UpdatePostUseCase;
  public readonly deletePost: DeletePostUseCase;
  public readonly toggleLike: ToggleLikeUseCase;
  public readonly addComment: AddCommentUseCase;
  public readonly updateComment: UpdateCommentUseCase;
  public readonly deleteComment: DeleteCommentUseCase;
  public readonly listAllComments: ListAllCommentsUseCase;

  constructor(prisma: PrismaClient) {
    const repository = new FreshRepository(prisma);
    this.createPost = new CreatePostUseCase(repository);
    this.listPosts = new ListPostsUseCase(repository);
    this.listAllPosts = new ListAllPostsUseCase(repository);
    this.getPostDetails = new GetPostDetailsUseCase(repository);
    this.updatePost = new UpdatePostUseCase(repository);
    this.deletePost = new DeletePostUseCase(repository);
    this.toggleLike = new ToggleLikeUseCase(repository);
    this.addComment = new AddCommentUseCase(repository);
    this.updateComment = new UpdateCommentUseCase(repository);
    this.deleteComment = new DeleteCommentUseCase(repository);
    this.listAllComments = new ListAllCommentsUseCase(repository);
  }
}
