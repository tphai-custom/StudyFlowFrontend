import { describe, expect, it } from "vitest";
import { getDayKeyFromISO } from "@/src/lib/datetime";

describe("getDayKeyFromISO", () => {
  it("resolves day key for timezone ahead of UTC", () => {
    const iso = "2024-02-13T23:30:00.000Z";
    const dayKey = getDayKeyFromISO(iso, "Asia/Ho_Chi_Minh");
    expect(dayKey).toBe("2024-02-14");
  });

  it("resolves day key for timezone behind UTC", () => {
    const iso = "2024-02-14T01:00:00.000Z";
    const dayKey = getDayKeyFromISO(iso, "America/New_York");
    expect(dayKey).toBe("2024-02-13");
  });
});
