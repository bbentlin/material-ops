import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { 
    sendLowStockAlert,
    sendPurchaseOrderStatusAlert,
 } from "./notifications";

describe("notifications", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(""),
      }),
    );

    process.env.SLACK_WEBHOOK_URL =
      "https://hooks.slack.com/services/test";
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.ALERT_EMAIL_RECIPIENTS = 
      "ops@example.com,warehouse@example.com";
    process.env.EMAIL_FROM = 
      "LogiCore Inventory Management Alerts <alerts@example.com>";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SLACK_WEBHOOK_URL;
    delete process.env.RESEND_API_KEY;
    delete process.env.ALERT_EMAIL_RECIPIENTS;
    delete process.env.EMAIL_FROM;
  });

  it("sends Slack and email for low stock", async () => {
    await sendLowStockAlert({
      materialId: "material-1",
      materialName: "Steel Beam",
      partNumber: "STL-001",
      quantity: 0,
      minQuantity: 10,
      unit: "pieces",
      location: "Warehouse A",
      department: "Construction",
    });

    const fetchMock = vi.mocked(globalThis.fetch);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.slack.com/services/test",
      expect.objectContaining({
        method: "POST",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_test_key",
        }),
      }),
    );
  });

  it("sends PO status notifications", async () => {
    await sendPurchaseOrderStatusAlert({
      orderId: "po-1",
      orderNumber: "PO-20260822-001",
      supplier: "Acme Supply",
      previousStatus: "SUBMITTED",
      newStatus: "APPROVED",
      actorName: "Admin",
    });

    const fetchMock = vi.mocked(globalThis.fetch);
    const slackCall = fetchMock.mock.calls.find(
      ([url]) => url === "https://hooks.slack.com/services/test",
    );

    expect(slackCall).toBeTruthy();

    const body = JSON.parse(String(slackCall?.[1]?.body));

    expect(body.text).toContain("PO-20260822-001");
    expect(body.text).toContain("SUBMITTED -> APPROVED");
  });

  it("does nothing when integrations are not configured", async () => {
    delete process.env.SLACK_WEBHOOK_URL;
    delete process.env.RESEND_API_KEY;
    delete process.env.ALERT_EMAIL_RECIPIENTS;
    delete process.env.EMAIL_FROM;

    await sendLowStockAlert({
      materialId: "material-1",
      materialName: "Steel Beam",
      partNumber: "STL-001",
      quantity: 0,
      minQuantity: 10,
    });

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});