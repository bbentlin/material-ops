import { test, expect, type Page } from "@playwright/test";

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function loginAsAdmin(page: Page) {
  await loginAs(page, "admin@materialops.com", "Admin!Change#Me2026");
}

async function loginAsOperator(page: Page) {
  await loginAs(page, "operator@materialops.com", "Operator!Change#Me2026");
}

test.describe.serial("critical inventory flows", () => {
  test("admin can login and see dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText("LogiCore Inventory Management System")).toBeVisible();
  });

  test("admin can create material and record inbound movement", async ({ page }) => {
    await loginAsAdmin(page);

    const unique = Date.now();
    const materialName = "E2E Material " + String(unique);
    const partNumber = "E2E-" + String(unique);

    await page.getByRole("button", { name: /Add Material/i }).click();

    await page.getByLabel(/Name/i).fill(materialName);
    await page.getByLabel(/Part Number/i).fill(partNumber);
    await page.getByLabel(/Description/i).fill("Created in e2e critical flow");
    await page.getByLabel(/Quantity/i).fill("5");
    await page.getByLabel(/Unit/i).fill("pieces");
    await page.getByLabel(/Location/i).fill("E2E Rack");
    await page.getByRole("button", { name: /Add Material/i }).last().click();

    await expect(page.getByText(materialName).first()).toBeVisible();

    const row = page.locator("tr").filter({ hasText: materialName }).first();
    await row.getByRole("button", { name: /Inbound/i }).click();

    await page.getByLabel(/Quantity/i).fill("3");
    await page.getByLabel(/Note/i).fill("e2e inbound");
    await page.getByRole("button", { name: /Record Inbound/i }).click();

    await expect(page.getByText(/Inbound recorded/i)).toBeVisible();

    await page.goto("/dashboard/audit-log");

    const createdRow = page
      .locator("tr")
      .filter({ hasText: materialName })
      .filter({ hasText: "Create Material" })
      .first();

    await expect(createdRow).toBeVisible();
  });

  test("admin can transfer stock between materials", async ({ page }) => {
    await loginAsAdmin(page);

    const unique = crypto.randomUUID();
    const sourceName = "E2E Transfer Source " + unique;
    const sourcePart = "E2E-TS-" + unique;
    const destName = "E2E Transfer Dest " + unique;
    const destPart = "E2E-TD-" + unique;

    async function createMaterial(name: string, partNumber: string, qty: string) {
      const openAddButton = page.getByRole("button", { name: /Add Material/i }).first();
      await expect(openAddButton).toBeVisible({ timeout: 15000 });
      await openAddButton.click();

      const modalForm = page.locator("form").filter({ has: page.locator("#add-name") });
      await expect(modalForm).toBeVisible();

      await page.locator("#add-name").fill(name);
      await page.locator("#add-partNumber").fill(partNumber);
      await page.locator("#add-description").fill("e2e transfer setup");
      await page.locator("#add-quantity").fill(qty);
      await page.locator("#add-unit").fill("pieces");
      await page.locator("#add-location").fill("E2E Transfer Rack");

      const createReq = page.waitForResponse(
        (res) =>
          (res.url().includes("/api/materials") &&
          res.request().method() === "POST" &&
          res.request().postData()?.includes(partNumber)) || false
      );

      await modalForm.getByRole("button", { name: /^Add Material$/i }).click();

      const createRes = await createReq;
      if (!createRes.ok()) {
        throw new Error(`Create material failed: ${createRes.status()} ${await createRes.text()}`);
      }

      await expect(modalForm).toHaveCount(0);

      const createdRow = page.locator("tr").filter({ hasText: name }).first();
      await expect(createdRow).toBeVisible({ timeout: 15000 });
    }

    await createMaterial(sourceName, sourcePart, "5");
    await createMaterial(destName, destPart, "1");

    const sourceRow = page.locator("tr").filter({ hasText: sourceName }).first();
    await expect(sourceRow).toBeVisible();
    await sourceRow.getByRole("button", { name: /\bTransfer$/ }).click();

    const destSelect = page.locator("#transfer-dest");
    await expect(destSelect).toBeVisible();

    await expect
      .poll(async () => await destSelect.locator("option", { hasText: destName }).count())
      .toBeGreaterThan(0);

    const destOption = destSelect.locator("option", { hasText: destName }).first();
    const destValue = await destOption.getAttribute("value");
    expect(destValue).toBeTruthy();

    await destSelect.selectOption(destValue!);

    await page.locator("#transfer-qty").fill("1");
    await page.locator("#transfer-note").fill("e2e transfer");
    await page.getByRole("button", { name: /^Transfer$/i }).click();

    await expect(page.getByText(/Transfer completed/i)).toBeVisible();

    await page.goto("/dashboard/audit-log");
    await expect(page.getByText(/Transfer/i).first()).toBeVisible();
  });

  test("operator cannot see users admin control", async ({ page }) => {
    await loginAsOperator(page);

    await expect(page.getByRole("button", { name: /Users/i })).toHaveCount(0);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("LogiCore Inventory Management System")).toBeVisible();
  });
});