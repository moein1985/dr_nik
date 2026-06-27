import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "../Avatar";

describe("Avatar", () => {
  it("renders image when imageUrl is provided", () => {
    render(<Avatar username="testuser" imageUrl="/uploads/avatar.jpg" size={40} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/uploads/avatar.jpg");
    expect(img).toHaveAttribute("alt", "testuser");
  });

  it("renders initial when no imageUrl is provided", () => {
    render(<Avatar username="testuser" size={40} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders ? when no username and no imageUrl", () => {
    render(<Avatar size={40} />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("applies correct size styles", () => {
    render(<Avatar username="test" size={80} />);
    const avatar = screen.getByText("T").parentElement;
    expect(avatar).toHaveStyle({ width: "80px", height: "80px" });
  });
});
