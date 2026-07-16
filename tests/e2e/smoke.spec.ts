import { test, expect } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { status: string };
  expect(body.status).toBe("ok");
});

test("protected home renders the app shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
  await expect(page.getByText("UM6P", { exact: false })).toBeVisible();
});

test("administration users screen lists seeded users", async ({ page }) => {
  await page.goto("/administration/users");
  await expect(page.getByRole("heading", { name: "Utilisateurs & Rôles" })).toBeVisible();
  await expect(page.getByText("admin@um6p.ma")).toBeVisible();
});
