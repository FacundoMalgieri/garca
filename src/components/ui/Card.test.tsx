import { describe, expect, it } from "vitest";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";

import { render, screen } from "@testing-library/react";

describe("Card Components", () => {
  describe("Card", () => {
    it("should render children", () => {
      render(<Card>Test content</Card>);
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should have base styling", () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toHaveClass("bg-white");
    });
  });

  describe("CardHeader", () => {
    it("should render children", () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("should have margin-bottom", () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      expect(container.firstChild).toHaveClass("mb-4");
    });
  });

  describe("CardTitle", () => {
    it("should render as h3", () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("should render children", () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    it("should have font styling", () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      expect(container.firstChild).toHaveClass("font-semibold");
    });
  });

  describe("CardDescription", () => {
    it("should render children", () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("should have muted text color", () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      expect(container.firstChild).toHaveClass("text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    it("should render children", () => {
      render(<CardContent>Content area</CardContent>);
      expect(screen.getByText("Content area")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>);
      expect(container.firstChild).toHaveClass("custom-content");
    });
  });

  describe("Full Card composition", () => {
    it("should render complete card structure", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test description</CardDescription>
          </CardHeader>
          <CardContent>Main content here</CardContent>
        </Card>
      );

      expect(screen.getByRole("heading", { name: "Test Card" })).toBeInTheDocument();
      expect(screen.getByText("This is a test description")).toBeInTheDocument();
      expect(screen.getByText("Main content here")).toBeInTheDocument();
    });
  });
});

