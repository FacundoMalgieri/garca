import { describe, expect, it, vi } from "vitest";

import { createIdempotencyStore } from "@/lib/facturador/idempotency";

describe("createIdempotencyStore", () => {
  it("ejecuta fn en una key nueva y devuelve su resultado", async () => {
    const store = createIdempotencyStore<string>();
    const fn = vi.fn(async () => "cae-123");

    const res = await store.run("k1", fn);

    expect(res).toBe("cae-123");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cachea el resultado: una key ya `done` no vuelve a ejecutar fn", async () => {
    const store = createIdempotencyStore<string>();
    const fn = vi.fn(async () => "cae-123");

    const first = await store.run("k1", fn);
    const second = await store.run("k1", fn);

    expect(first).toBe("cae-123");
    expect(second).toBe("cae-123");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("comparte la misma promise cuando la key está in-flight (requests concurrentes)", async () => {
    const store = createIdempotencyStore<string>();
    let resolveFn: (v: string) => void = () => {};
    const fn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        }),
    );

    const p1 = store.run("k1", fn);
    const p2 = store.run("k1", fn);

    resolveFn("cae-xyz");
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe("cae-xyz");
    expect(r2).toBe("cae-xyz");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("limpia entradas vencidas por TTL y permite re-ejecutar", async () => {
    const store = createIdempotencyStore<string>({ ttlMs: 1000 });
    const fn = vi.fn(async () => "cae-123");

    await store.run("k1", fn, 0);
    expect(store.size()).toBe(1);

    // Un request posterior al TTL limpia la vieja y re-ejecuta.
    await store.run("k1", fn, 2000);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("no cachea fallas: si fn throw-ea, un reintento con la misma key re-ejecuta", async () => {
    const store = createIdempotencyStore<string>();
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce("cae-ok");

    await expect(store.run("k1", fn)).rejects.toThrow("boom");
    expect(store.size()).toBe(0);

    const res = await store.run("k1", fn);
    expect(res).toBe("cae-ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
