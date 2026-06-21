import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should allow first request", () => {
    const result = checkRateLimit("rl-allow-first");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should track multiple requests", () => {
    checkRateLimit("rl-track-1");
    checkRateLimit("rl-track-2");
    const result = checkRateLimit("rl-track-3");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should block after max attempts", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("rl-block-max");
    }
    const result = checkRateLimit("rl-block-max");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset after window expires", () => {
    const windowMs = 15 * 60 * 1000;
    for (let i = 0; i < 5; i++) {
      checkRateLimit("rl-reset-window", 5, windowMs);
    }
    const blocked = checkRateLimit("rl-reset-window", 5, windowMs);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(windowMs + 1);

    const reset = checkRateLimit("rl-reset-window", 5, windowMs);
    expect(reset.allowed).toBe(true);
  });

  it("should use custom max attempts", () => {
    checkRateLimit("rl-custom-max", 2);
    checkRateLimit("rl-custom-max", 2);
    const result = checkRateLimit("rl-custom-max", 2);
    expect(result.allowed).toBe(false);
  });

  it("should isolate different keys", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("rl-iso-a", 3);
    }
    const resultA = checkRateLimit("rl-iso-a", 3);
    const resultB = checkRateLimit("rl-iso-b", 3);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });
});
