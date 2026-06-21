import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsertValues = vi.fn().mockResolvedValue([]);

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({ values: mockInsertValues })),
  },
  schema: {
    login_logs: {
      id: "id",
      user_id: "user_id",
      username: "username",
      aktivitas: "aktivitas",
    },
  },
}));

import { logActivity } from "./activity-log";

describe("activity-log", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log activity with valid userId", async () => {
    await logActivity("user-1", "Login ke panel admin", "admin");
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        aktivitas: "Login ke panel admin",
        username: "admin",
      })
    );
  });

  it("should skip logging when userId is null", async () => {
    await logActivity(null, "Test activity");
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it("should skip logging when userId is undefined", async () => {
    await logActivity(undefined, "Test activity");
    expect(mockInsertValues).not.toHaveBeenCalled();
  });

  it("should use 'unknown' when username is not provided", async () => {
    await logActivity("user-1", "Test activity");
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "unknown",
      })
    );
  });

  it("should use 'unknown' when username is null", async () => {
    await logActivity("user-1", "Test activity", null);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "unknown",
      })
    );
  });

  it("should log error when db insert fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockInsertValues.mockRejectedValueOnce(new Error("DB error"));
    await logActivity("user-1", "Test activity", "admin");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
