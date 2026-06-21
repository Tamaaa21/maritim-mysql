import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";

vi.mock("fs/promises", () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("sharp", () => ({
  default: vi.fn().mockImplementation(() => ({
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("converted-webp")),
  })),
}));

import { validateFile, uploadFile, uploadMultipleFiles, deleteFile, fileExists, FileValidationError } from "./storage";

function createMockFile(size: number, type: string, name = "test-file.jpg"): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("FileValidationError", () => {
    it("should be an instance of Error", () => {
      const error = new FileValidationError("test error");
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("FileValidationError");
      expect(error.message).toBe("test error");
    });
  });

  describe("validateFile", () => {
    it("should accept valid image file", () => {
      const file = createMockFile(1024, "image/jpeg");
      expect(() => validateFile(file)).not.toThrow();
    });

    it("should accept valid pdf file", () => {
      const file = createMockFile(1024, "application/pdf");
      expect(() => validateFile(file)).not.toThrow();
    });

    it("should throw on oversized file", () => {
      const file = createMockFile(11 * 1024 * 1024, "image/jpeg");
      expect(() => validateFile(file)).toThrow(FileValidationError);
      expect(() => validateFile(file)).toThrow("terlalu besar");
    });

    it("should throw on disallowed mime type", () => {
      const file = createMockFile(1024, "application/msword");
      expect(() => validateFile(file)).toThrow(FileValidationError);
      expect(() => validateFile(file)).toThrow("tidak diizinkan");
    });

    it("should accept webp images", () => {
      const file = createMockFile(1024, "image/webp");
      expect(() => validateFile(file)).not.toThrow();
    });

    it("should accept gif images", () => {
      const file = createMockFile(1024, "image/gif");
      expect(() => validateFile(file)).not.toThrow();
    });

    it("should reject bmp images", () => {
      const file = createMockFile(1024, "image/bmp");
      expect(() => validateFile(file)).toThrow(FileValidationError);
    });
  });

  describe("uploadFile", () => {
    it("should upload a valid file and return url and path", async () => {
      const file = createMockFile(1024, "image/png", "photo.png");
      const result = await uploadFile(file, "uploads");
      expect(result.url).toMatch(/^\/uploads\/uploads\//);
      expect(result.path).toMatch(/^uploads\//);
    });

    it("should convert convertible types to webp", async () => {
      const file = createMockFile(1024, "image/jpeg", "photo.jpg");
      const result = await uploadFile(file, "uploads");
      expect(result.url).toContain(".webp");
    });

    it("should handle non-convertible types (pdf)", async () => {
      const file = createMockFile(1024, "application/pdf", "doc.pdf");
      const result = await uploadFile(file, "documents");
      expect(result.url).toContain(".pdf");
    });

    it("should use custom folder", async () => {
      const file = createMockFile(1024, "image/png", "test.png");
      const result = await uploadFile(file, "custom-folder");
      expect(result.path).toMatch(/^custom-folder\//);
    });

    it("should default to uploads folder", async () => {
      const file = createMockFile(1024, "image/png", "test.png");
      const result = await uploadFile(file);
      expect(result.path).toMatch(/^uploads\//);
    });

    it("should throw on invalid file", async () => {
      const file = createMockFile(1024, "application/msword", "doc.doc");
      await expect(uploadFile(file)).rejects.toThrow(FileValidationError);
    });
  });

  describe("uploadMultipleFiles", () => {
    it("should upload multiple files", async () => {
      const files = [
        createMockFile(1024, "image/png", "a.png"),
        createMockFile(1024, "image/jpeg", "b.jpg"),
      ];
      const results = await uploadMultipleFiles(files, "batch");
      expect(results).toHaveLength(2);
      expect(results[0].path).toMatch(/^batch\//);
      expect(results[1].path).toMatch(/^batch\//);
    });
  });

  describe("deleteFile", () => {
    it("should delete existing file", async () => {
      const { default: fsModule } = await import("fs/promises");
      vi.mocked(fsModule.unlink).mockResolvedValue(undefined);
      await deleteFile("uploads/test.webp");
      expect(fsModule.unlink).toHaveBeenCalled();
    });

    it("should silently ignore ENOENT errors", async () => {
      const { default: fsModule } = await import("fs/promises");
      const enoentError = new Error("ENOENT") as NodeJS.ErrnoException;
      enoentError.code = "ENOENT";
      vi.mocked(fsModule.unlink).mockRejectedValue(enoentError);
      await expect(deleteFile("nonexistent.webp")).resolves.not.toThrow();
    });

    it("should log other errors", async () => {
      const { default: fsModule } = await import("fs/promises");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fsModule.unlink).mockRejectedValue(new Error("Permission denied"));
      await deleteFile("locked.webp");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("fileExists", () => {
    it("should return true when file exists", async () => {
      const { default: fsModule } = await import("fs/promises");
      vi.mocked(fsModule.access).mockResolvedValue(undefined);
      const result = await fileExists("uploads/test.webp");
      expect(result).toBe(true);
    });

    it("should return false when file does not exist", async () => {
      const { default: fsModule } = await import("fs/promises");
      vi.mocked(fsModule.access).mockRejectedValue(new Error("ENOENT"));
      const result = await fileExists("nonexistent.webp");
      expect(result).toBe(false);
    });
  });
});
