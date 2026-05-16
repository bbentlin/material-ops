import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@materialops.com");
  await page.getByLabel("Password").fill("Admin!Change#Me2026");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("app route error boundary renders on login crash", async ({ page }) => {
  await page.goto("/login?e2eCrashApp=1");
  await expect(page.getByText("Something went wrong")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("dashboard segment error boundary renders", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard?e2eCrashDashboard=1");
  await expect(page.getByText("Dashboard error")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry section" })).toBeVisible();
});

test("admin segment error boundary renders", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin?e2eCrashAdmin=1");
  await expect(page.getByText("Admin error")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry section" })).toBeVisible();
});

test("global error boundary renders on layout crash", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "e2eCrashGlobal",
      value: "1",
      url: "http://localhost:3000",
    },
  ]);

  await page.goto("/login");
  await expect(page.getByText("A critical error has occurred")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});