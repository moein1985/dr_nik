import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { JalaliDatePicker } from "@/components/jalali-date-picker";

describe("JalaliDatePicker (Bug 2)", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render a readonly input with placeholder", () => {
    render(<JalaliDatePicker value="" onChange={vi.fn()} placeholder="تاریخ شمسی" />);
    const input = screen.getByPlaceholderText("تاریخ شمسی");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
  });

  it("should display Persian digits for the value", () => {
    render(<JalaliDatePicker value="1405/03/15" onChange={vi.fn()} />);
    const input = screen.getByDisplayValue("۱۴۰۵/۰۳/۱۵");
    expect(input).toBeInTheDocument();
  });

  it("should open calendar popover on click", () => {
    render(<JalaliDatePicker value="" onChange={vi.fn()} placeholder="select date" />);
    const input = screen.getByPlaceholderText("select date");
    fireEvent.click(input);
    // Calendar should show month name and navigation buttons
    expect(screen.getByText("<")).toBeInTheDocument();
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  it("should call onChange when a day is selected", () => {
    const onChange = vi.fn();
    render(<JalaliDatePicker value="" onChange={onChange} placeholder="select" />);
    const input = screen.getByPlaceholderText("select");
    fireEvent.click(input);
    // Click on day 15
    const dayButton = screen.getByText("۱۵");
    fireEvent.click(dayButton);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}\/\d{2}\/15$/));
  });

  it("should close calendar after selecting a day", () => {
    const onChange = vi.fn();
    render(<JalaliDatePicker value="" onChange={onChange} placeholder="select" />);
    const input = screen.getByPlaceholderText("select");
    fireEvent.click(input);
    const dayButton = screen.getByText("۱");
    fireEvent.click(dayButton);
    // Calendar should be closed - navigation buttons should not be visible
    expect(screen.queryByText("<")).not.toBeInTheDocument();
  });

  it("should navigate to next month", () => {
    render(<JalaliDatePicker value="" onChange={vi.fn()} placeholder="select" />);
    const input = screen.getByPlaceholderText("select");
    fireEvent.click(input);
    const nextBtn = screen.getByText(">");
    fireEvent.click(nextBtn);
    // Calendar should still be open
    expect(screen.getByText("<")).toBeInTheDocument();
  });

  it("should navigate to previous month", () => {
    render(<JalaliDatePicker value="" onChange={vi.fn()} placeholder="select" />);
    const input = screen.getByPlaceholderText("select");
    fireEvent.click(input);
    const prevBtn = screen.getByText("<");
    fireEvent.click(prevBtn);
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  it("should highlight selected day", () => {
    render(<JalaliDatePicker value="1405/03/15" onChange={vi.fn()} placeholder="select" />);
    const input = screen.getByDisplayValue("۱۴۰۵/۰۳/۱۵");
    fireEvent.click(input);
    const selectedDay = screen.getByText("۱۵");
    expect(selectedDay).toHaveClass("bg-cyan-600");
  });
});
