import { describe, expect, it } from "vitest";

import {
  ArrowRightIcon,
  ChartIcon,
  ClipboardIcon,
  DocumentIcon,
  DownloadIcon,
  LoadingSpinner,
  LockIcon,
  PayPalIcon,
  PlayIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingIcon,
} from "./icons";

import { render } from "@testing-library/react";

describe("Icons", () => {
  it("renders ArrowRightIcon", () => {
    const { container } = render(<ArrowRightIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders ArrowRightIcon with custom className", () => {
    const { container } = render(<ArrowRightIcon className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("renders PlayIcon", () => {
    const { container } = render(<PlayIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders PlayIcon with custom className", () => {
    const { container } = render(<PlayIcon className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("renders LoadingSpinner", () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
  });

  it("renders SparklesIcon", () => {
    const { container } = render(<SparklesIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders DocumentIcon", () => {
    const { container } = render(<DocumentIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders ChartIcon", () => {
    const { container } = render(<ChartIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders ClipboardIcon", () => {
    const { container } = render(<ClipboardIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders LockIcon", () => {
    const { container } = render(<LockIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders TrendingIcon", () => {
    const { container } = render(<TrendingIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders DownloadIcon", () => {
    const { container } = render(<DownloadIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders ShieldCheckIcon", () => {
    const { container } = render(<ShieldCheckIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders PayPalIcon", () => {
    const { container } = render(<PayPalIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders PayPalIcon with custom className", () => {
    const { container } = render(<PayPalIcon className="custom-size" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-size");
  });
});

