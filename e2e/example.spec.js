/**
 * Boilerplate example tests — copy and adapt these patterns for new projects.
 *
 * Patterns shown here:
 *   devLogin()     — simulate a CAS session without going through SSO
 *   devLogout()    — clear the session between tests
 *   form submit    — filling a form and asserting flash feedback
 *   page content   — checking text, selectors, and UoS branding
 */
import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Log in via the dev CAS login form and wait for the redirect home.
 * Use this at the start of any test that needs an authenticated user.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ username?: string, employeeType?: string, shefPersonCode?: string }} opts
 */
async function devLogin(page, { username = "testuser", employeeType = "student", shefPersonCode = "" } = {}) {
  await page.goto("/dev/login");
  await page.fill("#username", username);
  await page.fill("#employeeType", employeeType);
  if (shefPersonCode) await page.fill("#shefPersonCode", shefPersonCode);
  await page.click('button[type="submit"]');
  await page.waitForURL("/");
}

/**
 * Destroy the session by posting to /dev/logout.
 * Useful when a test needs to go from logged-in back to anonymous.
 *
 * @param {import("@playwright/test").Page} page
 */
async function devLogout(page) {
  await page.goto("/dev/login");
  const logoutBtn = page.locator('form[action="/dev/logout"] button');
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForURL("/dev/login");
  }
}

// ---------------------------------------------------------------------------
// Public pages
// ---------------------------------------------------------------------------

test("home page loads with UoS branding", async ({ page }) => {
  await page.goto("/");

  // Sheffield branding assets are referenced (matches CSS link + favicon — use first())
  await expect(page.locator('link[href*="sheffield.ac.uk/branding"]').first()).toBeAttached();

  // App title is present in the header
  await expect(page.locator(".app-title")).toBeVisible();
});

test("health endpoint returns JSON with status ok", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBeTruthy();

  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(typeof body.uptime).toBe("number");
});

// ---------------------------------------------------------------------------
// Dev login
// ---------------------------------------------------------------------------

test("dev login sets a CAS session and redirects home", async ({ page }) => {
  await page.goto("/dev/login");

  await page.fill("#username", "ab1cde");
  await page.fill("#employeeType", "student");
  await page.click('button[type="submit"]');

  // Redirected home after login
  await expect(page).toHaveURL("/");

  // Returning to /dev/login shows the active session
  await page.goto("/dev/login");
  await expect(page.locator(".alert--success")).toContainText("ab1cde");
});

test("dev logout clears the session", async ({ page }) => {
  await devLogin(page, { username: "ab1cde" });

  await page.goto("/dev/login");
  await page.locator('form[action="/dev/logout"] button').click();

  // After logout the session banner is gone
  await expect(page.locator(".alert--success")).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// Items — CRUD example (copy this pattern for feature tests)
// ---------------------------------------------------------------------------

test("items list shows empty state when no items exist", async ({ page }) => {
  await devLogin(page);
  await page.goto("/items");

  await expect(page.locator("h1")).toContainText("Items");
  await expect(page.locator(".empty-state")).toBeVisible();
});

test("creating an item shows a success flash and appears in the list", async ({ page }) => {
  await devLogin(page);
  await page.goto("/items/new");

  await page.fill("#name", "My test item");
  await page.click('button[type="submit"]');

  // PRG: redirected back to the list
  await expect(page).toHaveURL("/items");

  // Flash message confirms the creation
  await expect(page.locator(".alert--success")).toContainText("My test item");

  // Item appears in the table
  await expect(page.locator("table")).toContainText("My test item");
});

test("submitting the form without a name shows a validation error", async ({ page }) => {
  await devLogin(page);
  await page.goto("/items/new");

  // Fill whitespace only — bypasses the browser's native `required` validation
  // while the server trims the value and rejects it, demonstrating server-side validation.
  await page.fill("#name", "   ");
  await page.click('button[type="submit"]');

  // Stays on the new-item page and shows an error flash
  await expect(page).toHaveURL("/items/new");
  await expect(page.locator(".alert--warning")).toContainText("required");
});

test("deleting an item removes it from the list", async ({ page }) => {
  await devLogin(page);

  // Create an item first
  await page.goto("/items/new");
  await page.fill("#name", "To be deleted");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/items");

  // Set up the confirm dialog to auto-accept
  page.on("dialog", (dialog) => dialog.accept());
  // Target the specific row so the test stays correct even if other items exist in the store.
  await page.locator("tr").filter({ hasText: "To be deleted" }).locator('button[type="submit"]').click();

  // After deletion, the item is gone
  await expect(page.locator("table")).not.toContainText("To be deleted");
});
