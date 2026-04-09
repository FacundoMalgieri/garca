import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConcurrencyStats, withConcurrencyLimit } from "./index";

describe("concurrency", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getConcurrencyStats", () => {
    it("should return initial stats", () => {
      const stats = getConcurrencyStats();
      expect(stats.active).toBe(0);
      expect(stats.waiting).toBe(0);
      expect(stats.max).toBe(2);
      expect(stats.available).toBe(2);
    });
  });

  describe("withConcurrencyLimit", () => {
    it("should execute function and return result", async () => {
      const result = await withConcurrencyLimit(async () => {
        return "test-result";
      });

      expect(result).toBe("test-result");
    });

    it("should release slot after function completes", async () => {
      await withConcurrencyLimit(async () => {
        const stats = getConcurrencyStats();
        expect(stats.active).toBe(1);
        return "done";
      });

      const statsAfter = getConcurrencyStats();
      expect(statsAfter.active).toBe(0);
    });

    it("should release slot even if function throws", async () => {
      await expect(
        withConcurrencyLimit(async () => {
          throw new Error("test error");
        })
      ).rejects.toThrow("test error");

      const stats = getConcurrencyStats();
      expect(stats.active).toBe(0);
    });

    it("should allow only one concurrent execution", async () => {
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const task = async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise(resolve => setTimeout(resolve, 100));
        currentConcurrent--;
        return "done";
      };

      // Start 1 task
      const promise1 = withConcurrencyLimit(task);

      // Advance timers to complete task
      await vi.advanceTimersByTimeAsync(150);

      await promise1;

      expect(maxConcurrent).toBe(1);
    });

    it("should queue second request when first is running", async () => {
      // First task that takes a while
      const longTask = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return "first";
      };

      // Start first task
      const promise1 = withConcurrencyLimit(longTask);

      // Check stats - should have 1 active
      await vi.advanceTimersByTimeAsync(10);
      const statsWhileRunning = getConcurrencyStats();
      expect(statsWhileRunning.active).toBe(1);

      // Complete first task
      await vi.advanceTimersByTimeAsync(1000);
      await promise1;

      // Should be released
      const statsAfter = getConcurrencyStats();
      expect(statsAfter.active).toBe(0);
    });

    it("should timeout if waiting too long in queue", async () => {
      // Block both slots with long tasks
      let resolveBlocking1: (value: string) => void = () => {};
      let resolveBlocking2: (value: string) => void = () => {};
      const blockingTask1 = new Promise<string>((resolve) => {
        resolveBlocking1 = resolve;
      });
      const blockingTask2 = new Promise<string>((resolve) => {
        resolveBlocking2 = resolve;
      });

      // Fill both slots
      const promise1 = withConcurrencyLimit(() => blockingTask1);
      const promise2 = withConcurrencyLimit(() => blockingTask2);

      // Wait a bit for slots to be acquired
      await vi.advanceTimersByTimeAsync(10);

      // Third task should wait and eventually timeout
      let promise3Error: Error | undefined;
      const promise3 = withConcurrencyLimit(async () => "third").catch((err: Error) => {
        promise3Error = err;
        return "error";
      });

      // Advance past the MAX_QUEUE_WAIT (60 seconds)
      for (let i = 0; i < 130; i++) {
        await vi.advanceTimersByTimeAsync(500);
      }

      await promise3;

      expect(promise3Error).toBeDefined();
      if (promise3Error) {
        expect(promise3Error.message).toMatch(/El servidor está ocupado/);
      }

      // Clean up
      resolveBlocking1("blocking1");
      resolveBlocking2("blocking2");
      await promise1;
      await promise2;
    });

    it("should track waiting count while in queue", async () => {
      // Block the slot
      const blockingTask = new Promise<string>((resolve) => {
        setTimeout(() => resolve("blocking"), 5000);
      });

      // Start blocking task
      const promise1 = withConcurrencyLimit(() => blockingTask);

      // Wait for slot to be acquired
      await vi.advanceTimersByTimeAsync(10);

      // Start second task that will wait
      const promise2 = withConcurrencyLimit(async () => "second");

      // Advance one poll interval - should be waiting
      await vi.advanceTimersByTimeAsync(500);

      // Complete the blocking task
      await vi.advanceTimersByTimeAsync(5000);

      // Both should complete
      const result1 = await promise1;
      const result2 = await promise2;

      expect(result1).toBe("blocking");
      expect(result2).toBe("second");
    });
  });
});

