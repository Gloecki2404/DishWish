import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataStore } from "./data-store";
import type { HomeAssistant } from "./types";

type Conn = HomeAssistant["connection"];

function fakeConn(failures: number) {
  let calls = 0;
  const conn: Conn = {
    sendMessagePromise: vi.fn(async () => {
      calls++;
      if (calls <= failures * 3) throw { code: "not_ready" };
      return [];
    }) as Conn["sendMessagePromise"],
    subscribeMessage: vi.fn(async () => async () => undefined) as Conn["subscribeMessage"],
  };
  return conn;
}

describe("DataStore retry", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("retries while the backend is not ready and then loads", async () => {
    const store = new DataStore(fakeConn(2));
    store.subscribe(() => undefined);
    await vi.advanceTimersByTimeAsync(0);
    expect(store.loaded).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.loaded).toBe(false);
    await vi.advanceTimersByTimeAsync(2000);
    expect(store.loaded).toBe(true);
    expect(store.failed).toBe(false);
  });

  it("gives up after five retries and starts over on retry()", async () => {
    const store = new DataStore(fakeConn(100));
    store.subscribe(() => undefined);
    await vi.advanceTimersByTimeAsync(1000 + 2000 + 4000 + 8000 + 16000 + 100);
    expect(store.failed).toBe(true);
    expect(store.loaded).toBe(false);
    store.retry();
    await vi.advanceTimersByTimeAsync(0);
    expect(store.failed).toBe(false);
  });
});
