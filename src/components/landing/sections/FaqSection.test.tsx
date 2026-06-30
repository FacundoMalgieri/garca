import { describe, expect, it } from "vitest";

import { homeFaqEntries } from "@/lib/seo/page-schemas";

import { FaqSection } from "./FaqSection";

import { render, screen } from "@testing-library/react";

describe("FaqSection", () => {
  it("renderiza una pregunta por cada entrada de homeFaqEntries", () => {
    render(<FaqSection />);
    for (const entry of homeFaqEntries) {
      expect(screen.getByText(entry.question)).toBeInTheDocument();
    }
  });
});
