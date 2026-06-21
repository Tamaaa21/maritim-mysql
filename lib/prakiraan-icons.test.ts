import { describe, it, expect } from "vitest";
import { getIcon } from "./prakiraan-icons";

describe("prakiraan-icons", () => {
  it("should return Sun icon by default", () => {
    const icon = getIcon();
    expect(icon).toBeDefined();
  });

  it("should return Sun icon for unknown name", () => {
    const icon = getIcon("UnknownIcon");
    expect(icon).toBeDefined();
  });

  it("should return MapPin for MapPin", () => {
    const icon = getIcon("MapPin");
    expect(icon).toBeDefined();
  });

  it("should return Anchor for Anchor", () => {
    const icon = getIcon("Anchor");
    expect(icon).toBeDefined();
  });

  it("should return Waves for Waves", () => {
    const icon = getIcon("Waves");
    expect(icon).toBeDefined();
  });

  it("should return TrendingUp for TrendingUp", () => {
    const icon = getIcon("TrendingUp");
    expect(icon).toBeDefined();
  });
});
