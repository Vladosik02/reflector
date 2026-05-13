import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FAQ from "./FAQ";
import { faq } from "@/lib/content";

describe("FAQ", () => {
  it("renders all questions", () => {
    render(<FAQ />);
    for (const item of faq) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    }
  });

  it("opens first item by default and toggles on click", () => {
    render(<FAQ />);
    const firstQ = faq[0]!;
    const secondQ = faq[1]!;

    const firstButton = screen.getByRole("button", { name: firstQ.question });
    expect(firstButton).toHaveAttribute("aria-expanded", "true");

    const secondButton = screen.getByRole("button", { name: secondQ.question });
    expect(secondButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(secondButton);
    expect(secondButton).toHaveAttribute("aria-expanded", "true");
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
  });
});
