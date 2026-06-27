import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PostCard from "../PostCard";

const mockPost = {
  id: "post-1",
  author: {
    id: "author-1",
    username: "testauthor",
    avatarUrl: null,
  },
  mediaType: "IMAGE" as const,
  mediaUrl: "/uploads/test.jpg",
  caption: "Test caption line 1\nLine 2\nLine 3\nLine 4",
  createdAt: new Date(Date.now() - 3600 * 1000),
  likes: [{ id: "like-1", userId: "user-1" }],
  comments: [
    {
      id: "comment-1",
      content: "Nice!",
      userId: "user-2",
      user: { id: "user-2", username: "commenter", avatarUrl: null },
      createdAt: new Date(Date.now() - 1800 * 1000),
    },
  ],
  _count: { likes: 1, comments: 1 },
};

describe("PostCard", () => {
  it("renders author username", () => {
    render(
      <PostCard
        post={mockPost}
        onLike={() => {}}
        onComment={() => {}}
      />,
    );
    expect(screen.getByText("testauthor")).toBeInTheDocument();
  });

  it("renders image when mediaType is IMAGE", () => {
    render(
      <PostCard
        post={mockPost}
        onLike={() => {}}
        onComment={() => {}}
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/uploads/test.jpg");
  });

  it("renders video when mediaType is VIDEO", () => {
    const videoPost = { ...mockPost, mediaType: "VIDEO", mediaUrl: "/uploads/test.mp4" };
    render(
      <PostCard
        post={videoPost}
        onLike={() => {}}
        onComment={() => {}}
      />,
    );
    const video = screen.getByRole("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "/uploads/test.mp4");
  });

  it("calls onLike when like button is clicked", () => {
    const onLike = vi.fn();
    render(
      <PostCard
        post={mockPost}
        onLike={onLike}
        onComment={() => {}}
      />,
    );

    const likeButton = screen.getByRole("button", { name: "" }).closest("button");
    const heartIcon = document.querySelector(".lucide-heart");
    expect(heartIcon).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onLike).toHaveBeenCalledWith("post-1");
  });

  it("truncates caption when more than 3 lines", () => {
    render(
      <PostCard
        post={mockPost}
        onLike={() => {}}
        onComment={() => {}}
      />,
    );

    expect(screen.getByText("more")).toBeInTheDocument();
  });

  it("expands caption when 'more' is clicked", () => {
    render(
      <PostCard
        post={mockPost}
        onLike={() => {}}
        onComment={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("more"));
    expect(screen.queryByText("more")).not.toBeInTheDocument();
  });

  it("renders avatar with imageUrl when author has avatarUrl", () => {
    const postWithAvatar = {
      ...mockPost,
      author: { ...mockPost.author, avatarUrl: "/uploads/avatar.jpg" },
    };
    render(
      <PostCard
        post={postWithAvatar}
        onLike={() => {}}
        onComment={() => {}}
      />,
    );
    const img = screen.getByAltText("testauthor");
    expect(img).toHaveAttribute("src", "/uploads/avatar.jpg");
  });

  it("displays like count", () => {
    render(
      <PostCard
        post={mockPost}
        onLike={() => {}}
        onComment={() => {}}
      />,
    );
    expect(screen.getByText(/1 likes/)).toBeInTheDocument();
  });
});
