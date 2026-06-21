import { describe, it, expect } from "vitest";
import { getYoutubeVideoId, getYoutubeEmbedUrl, isYoutubeUrl } from "./youtube";

describe("youtube", () => {
  describe("getYoutubeVideoId", () => {
    it("should extract video ID from standard YouTube URL", () => {
      expect(getYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("should extract video ID from youtu.be short URL", () => {
      expect(getYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("should extract video ID from embed URL", () => {
      expect(getYoutubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("should extract video ID from shorts URL", () => {
      expect(getYoutubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("should return null for empty URL", () => {
      expect(getYoutubeVideoId("")).toBe(null);
    });

    it("should return null for non-YouTube URL", () => {
      expect(getYoutubeVideoId("https://example.com/video")).toBe(null);
    });

    it("should return null for malformed YouTube URL", () => {
      expect(getYoutubeVideoId("https://www.youtube.com/watch?v=short")).toBe(null);
    });
  });

  describe("getYoutubeEmbedUrl", () => {
    it("should return valid embed URL", () => {
      const url = getYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(url).toContain("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should return null for invalid URL", () => {
      expect(getYoutubeEmbedUrl("not-a-url")).toBe(null);
    });
  });

  describe("isYoutubeUrl", () => {
    it("should return true for YouTube URLs", () => {
      expect(isYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
      expect(isYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    });

    it("should return false for non-YouTube URLs", () => {
      expect(isYoutubeUrl("https://vimeo.com/123456")).toBe(false);
      expect(isYoutubeUrl("https://example.com")).toBe(false);
    });
  });
});
