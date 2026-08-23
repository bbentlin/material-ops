type LowStockAlertPayload = {
  materialId: string;
  materialName: string;
  partNumber: string;
  quantity: number;
  minQuantity: number;
  unit?: string | null;
  location?: string | null;
  department?: string | null;
};

type PurchaseOrderAlertPayload = {
  orderId: string;
  orderNumber: string;
  supplier: string;
  previousStatus: string;
  newStatus: string;
  actorName?: string;
};

function getRecipients(): string[] {
  return (process.env.ALERT_EMAIL_RECIPIENTS ?? "")
    .split(/[,;\n]+/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function escapeHtml(value: string): string {
  return value  
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendSlackMessage(text: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }); 

    if (!response.ok) {
      console.error(
        "Slack notification failed:",
        response.status,
        await response.text(),
      );
    }
  } catch (error) {
    console.error("Slack notification failed:", error);
  }
}

async function sendEmail(subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.EMAIL_FROM;
  const recipients = getRecipients();

  if (!apiKey || !sender || recipients.length === 0) return;

  try {
    const htmlBody = body 
      .split("\n")
      .map((line) => `<div>${escapeHtml(line)}</div>`)
      .join("");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "applicaton/json",
      },
      body: JSON.stringify({
        from: sender,
        to: recipients,
        subject,
        text: body,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      console.error(
        "Email notification failed:",
        response.status,
        await response.text(),
      );
    }
  } catch (error) {
    console.error("Email notification failed:", error);
  }
}

export async function sendLowStockAlert(
  payload: LowStockAlertPayload,
): Promise<void> {
  const severity = payload.quantity === 0 ? "CRITICAL": "LOW";

  const message = [
    `${severity} stock alert`,
    `Material: ${payload.materialName} (${payload.partNumber})`,
    `Quantity: ${payload.quantity} ${payload.unit ?? "units"}`,
    `Minimum: ${payload.minQuantity} ${payload.unit ?? "units"}`,
    `Location: ${payload.location || "Unassigned"}`,
    `Department: ${payload.department || "Unassigned"}`,
  ].join("\n");

  await Promise.allSettled([
    sendSlackMessage(`warning: *${message.replaceAll("\n", "\n")}*`),
    sendEmail(
      `[LogiCore Inventory Management] ${severity} stock alert: ${payload.materialName}`,
      message,
    ),
  ]);
}

export async function sendPurchaseOrderStatusAlert(
  payload: PurchaseOrderAlertPayload,
): Promise<void> {
  const message = [
    "Purchase order status update",
    `PO: ${payload.orderNumber}`,
    `Supplier: ${payload.supplier}`,
    `Status: ${payload.previousStatus} -> ${payload.newStatus}`,
    `Changed by: ${payload.actorName || "System"}`,
  ].join("\n");

  await Promise.allSettled([
    sendSlackMessage(`:package: *${message}*`),
    sendEmail(
    `[LogiCore Inventory Management] PO ${payload.orderNumber}: ${payload.newStatus}`,
    message,
    ),
  ]);
}