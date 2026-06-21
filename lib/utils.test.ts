import { describe, it, expect } from "vitest";
import { cn, isVideoUrl } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", false && "hidden", "extra");
      expect(result).toContain("base");
      expect(result).not.toContain("hidden");
      expect(result).toContain("extra");
    });

    it("should return empty string for no input", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });

  describe("isVideoUrl", () => {
    it("should detect .mp4 URLs", () => {
      expect(isVideoUrl("https://example.com/video.mp4")).toBe(true);
    });

    it("should detect .webm URLs", () => {
      expect(isVideoUrl("https://example.com/video.webm")).toBe(true);
    });

    it("should detect .ogg URLs", () => {
      expect(isVideoUrl("https://example.com/video.ogg")).toBe(true);
    });

    it("should detect .mov URLs", () => {
      expect(isVideoUrl("https://example.com/video.mov")).toBe(true);
    });

    it("should detect URLs containing '/video/'", () => {
      expect(isVideoUrl("https://example.com/media/video/clip")).toBe(true);
    });

    it("should return false for image URLs", () => {
      expect(isVideoUrl("https://example.com/image.jpg")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isVideoUrl("")).toBe(false);
    });
  });
});
