import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";
import packageJson from "../../package.json";
import { WED } from "../test/helpers";

describe("Footer", () => {
  it("shows the current year and the package.json version", () => {
    vi.setSystemTime(WED);
    render(<Footer />);
    expect(
      screen.getByText(`© 2026 Maple Symbols ━ v${packageJson.version} Beta`)
    ).toBeInTheDocument();
  });

  it("links to GitHub, Discord and PayPal in new tabs", () => {
    render(<Footer />);
    for (const [name, href] of [
      ["GitHub repository", "https://github.com/Hyporos/maple-symbols"],
      ["Discord server", "https://discord.gg/FTMgy2ZKPK"],
      ["Donate via PayPal", "https://www.paypal.com/donate/?hosted_button_id=RL3T3LA3QNVTU"],
    ]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
