import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommentSection from "../CommentSection";

const mockComments = [
  {
    id: "comment-1",
    content: "Great post!",
    userId: "user-1",
    user: { id: "user-1", username: "alice", avatarUrl: null },
    createdAt: new Date(Date.now() - 60 * 1000),
  },
  {
    id: "comment-2",
    content: "Nice content",
    userId: "user-2",
    user: { id: "user-2", username: "bob", avatarUrl: null },
    createdAt: new Date(Date.now() - 120 * 1000),
  },
  {
    id: "comment-3",
    content: "Third comment",
    userId: "user-3",
    user: { id: "user-3", username: "charlie", avatarUrl: null },
    createdAt: new Date(Date.now() - 180 * 1000),
  },
];

describe("CommentSection", () => {
  it("renders comments list", () => {
    render(
      <CommentSection
        postId="post-1"
        comments={mockComments}
        totalComments={3}
        onAddComment={() => {}}
      />,
    );

    expect(screen.getByText("Great post!")).toBeInTheDocument();
    expect(screen.getByText("Nice content")).toBeInTheDocument();
  });

  it("shows only first 2 comments when not expanded", () => {
    render(
      <CommentSection
        postId="post-1"
        comments={mockComments}
        totalComments={3}
        onAddComment={() => {}}
      />,
    );

    expect(screen.getByText("Great post!")).toBeInTheDocument();
    expect(screen.getByText("Nice content")).toBeInTheDocument();
    expect(screen.queryByText("Third comment")).not.toBeInTheDocument();
    expect(screen.getByText(/View all 3 comments/)).toBeInTheDocument();
  });

  it("shows all comments when expanded", () => {
    render(
      <CommentSection
        postId="post-1"
        comments={mockComments}
        totalComments={3}
        onAddComment={() => {}}
      />,
    );

    fireEvent.click(screen.getByText(/View all 3 comments/));
    expect(screen.getByText("Third comment")).toBeInTheDocument();
  });

  it("calls onAddComment with postId and content on submit", () => {
    const onAddComment = vi.fn();
    render(
      <CommentSection
        postId="post-1"
        comments={[]}
        totalComments={0}
        onAddComment={onAddComment}
        currentUser={{ id: "user-1", username: "alice" }}
      />,
    );

    const input = screen.getByPlaceholderText("Add a comment...");
    fireEvent.change(input, { target: { value: "New comment" } });
    fireEvent.click(screen.getByText("Post"));

    expect(onAddComment).toHaveBeenCalledWith("post-1", "New comment");
  });

  it("disables Post button when input is empty", () => {
    render(
      <CommentSection
        postId="post-1"
        comments={[]}
        totalComments={0}
        onAddComment={() => {}}
      />,
    );

    const postButton = screen.getByText("Post");
    expect(postButton).toBeDisabled();
  });

  it("submits comment on Enter key press", () => {
    const onAddComment = vi.fn();
    render(
      <CommentSection
        postId="post-1"
        comments={[]}
        totalComments={0}
        onAddComment={onAddComment}
      />,
    );

    const input = screen.getByPlaceholderText("Add a comment...");
    fireEvent.change(input, { target: { value: "Enter comment" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAddComment).toHaveBeenCalledWith("post-1", "Enter comment");
  });

  it("does not submit on Shift+Enter", () => {
    const onAddComment = vi.fn();
    render(
      <CommentSection
        postId="post-1"
        comments={[]}
        totalComments={0}
        onAddComment={onAddComment}
      />,
    );

    const input = screen.getByPlaceholderText("Add a comment...");
    fireEvent.change(input, { target: { value: "Shift enter" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

    expect(onAddComment).not.toHaveBeenCalled();
  });
});
