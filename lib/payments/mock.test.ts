import { describe, expect, it } from "vitest";
import { MockPaymentProvider } from "./mock";

describe("MockPaymentProvider", () => {
  const provider = new MockPaymentProvider();

  it("createCheckout returns a URL containing required params", async () => {
    const res = await provider.createCheckout({
      searchId: "search-1",
      amountMinor: 29900,
      currency: "rub",
      productName: "Test",
      successUrl: "http://localhost:3000/unlock/success",
      cancelUrl: "http://localhost:3000/unlock/cancel",
    });
    expect(res.url).toContain("/unlock/mock-checkout");
    expect(res.url).toContain("searchId=search-1");
    expect(res.url).toContain("eventId=");
    expect(res.providerSessionId).toMatch(/^mock_cs_/);
  });

  it("verifyAndParseWebhook accepts a valid payload", async () => {
    const event = await provider.verifyAndParseWebhook(
      JSON.stringify({
        eventId: "evt-1",
        searchId: "search-1",
        providerSessionId: "mock_cs_x",
      }),
      null,
    );
    expect(event.providerEventId).toBe("evt-1");
    expect(event.searchId).toBe("search-1");
    expect(event.isCompletedCheckout).toBe(true);
  });

  it("verifyAndParseWebhook rejects missing eventId", async () => {
    await expect(
      provider.verifyAndParseWebhook(JSON.stringify({ searchId: "x" }), null),
    ).rejects.toThrow(/eventId/);
  });

  it("verifyAndParseWebhook rejects missing searchId", async () => {
    await expect(
      provider.verifyAndParseWebhook(JSON.stringify({ eventId: "x" }), null),
    ).rejects.toThrow(/searchId/);
  });

  it("verifyAndParseWebhook rejects invalid JSON", async () => {
    await expect(provider.verifyAndParseWebhook("not json", null)).rejects.toThrow(/JSON/);
  });
});
