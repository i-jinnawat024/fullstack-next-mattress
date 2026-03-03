import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-page")).toBeVisible();
    const empty = page.getByTestId("home-empty");
    const search = page.getByTestId("catalog-search");
    const hasEmpty = await empty.isVisible();
    const hasSearch = await search.isVisible();
    expect(hasEmpty || hasSearch).toBe(true);
  });

  test("catalog search shows results or no-results", async ({ page }) => {
    await page.goto("/");
    const search = page.getByTestId("catalog-search");
    if (!(await search.isVisible())) {
      expect(await page.getByTestId("home-empty").isVisible()).toBe(true);
      return;
    }
    await search.fill("ไม่มีคำนี้จริงๆxyz");
    const noResults = page.getByTestId("catalog-no-results");
    const list = page.getByTestId("catalog-list");
    const hasNoResults = await noResults.isVisible();
    const hasList = await list.isVisible();
    expect(hasNoResults || hasList).toBe(true);
  });

  test("promotion page loads", async ({ page }) => {
    await page.goto("/promotion");
    await expect(page.getByTestId("promotion-page")).toBeVisible();
    const heading = page.getByTestId("promotion-heading");
    const addLink = page.getByRole("link", { name: /สร้างโปรโมชั่น/ });
    await expect(heading).toBeVisible();
    await expect(addLink).toBeVisible();
  });
});
