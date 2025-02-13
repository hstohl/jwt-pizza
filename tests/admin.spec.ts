import { fail } from "assert";
import { test, expect } from "playwright-test-coverage";

test("login", async ({ page }) => {
  await page.route("http://localhost:3000/api/franchise", async (route) => {
    const mockFranchiseResponse = [
      {
        id: 1,
        admins: [
          { email: "alice@jwt.com", id: 1, name: "Alice" },
          { email: "bobby@jwt.com", id: 2, name: "Bobby" },
        ],
        name: "Mama Ricci Downtown",
        stores: [
          { id: 1, name: "Downtown Store" },
          { id: 2, name: "Uptown Store" },
        ],
      },
      {
        id: 2,
        admins: [{ email: "charlie@jwt.com", id: 3, name: "Charlie" }],
        name: "Mama Ricci Suburbs",
        stores: [{ id: 3, name: "Suburb Store" }],
      },
    ];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockFranchiseResponse),
    });
  });

  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() == "PUT") {
      const loginReq = { email: "a@jwt.com", password: "a" };
      const loginRes = {
        user: {
          id: 3,
          name: "Fred Jones",
          email: "a@jwt.com",
          roles: [{ role: "admin" }],
        },
        token: "abcdef",
      };
      expect(route.request().method()).toBe("PUT");
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }
  });

  await page.goto("/");

  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "Register" })).not.toBeVisible();
  await expect(page.locator("#navbar-dark")).toContainText("Logout");
  await expect(page.getByLabel("Global")).toContainText("FJ");

  await page.getByRole("link", { name: "Admin" }).click();

  await expect(page.getByRole("heading")).toContainText("Mama Ricci's kitchen");
  await expect(page.locator("thead")).toContainText("Franchise");
  await expect(page.getByRole("table")).toContainText("Downtown Store");
  await expect(page.getByRole("table")).toContainText("Charlie");
  await expect(page.getByRole("table")).toContainText("Mama Ricci Suburbs");
  await expect(
    page.getByRole("row", { name: "Uptown Store ₿ Close" }).getByRole("button")
  ).toBeVisible();

  await page
    .getByRole("row", { name: "Uptown Store ₿ Close" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("heading")).toContainText("Sorry to see you go");
  await expect(page.getByRole("main")).toContainText(
    "Are you sure you want to close the Mama Ricci Downtown store Uptown Store ? This cannot be restored. All outstanding revenue will not be refunded."
  );
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading")).toContainText("Mama Ricci's kitchen");
  await expect(page.locator("thead")).toContainText("Franchise");
  await expect(page.getByRole("table")).toContainText("Downtown Store");
  await expect(page.getByRole("table")).toContainText("Charlie");
  await expect(page.getByRole("table")).toContainText("Mama Ricci Suburbs");
  await expect(
    page.getByRole("row", { name: "Uptown Store ₿ Close" }).getByRole("button")
  ).toBeVisible();

  await page
    .getByRole("row", { name: "Mama Ricci Downtown Alice," })
    .getByRole("button")
    .click();
  await expect(page.getByRole("main")).toContainText(
    "Are you sure you want to close the Mama Ricci Downtown franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded."
  );
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading")).toContainText("Mama Ricci's kitchen");
  await expect(page.locator("thead")).toContainText("Franchise");
  await expect(page.getByRole("table")).toContainText("Downtown Store");
  await expect(page.getByRole("table")).toContainText("Charlie");
  await expect(page.getByRole("table")).toContainText("Mama Ricci Suburbs");
  await expect(
    page.getByRole("row", { name: "Uptown Store ₿ Close" }).getByRole("button")
  ).toBeVisible();

  await page.getByRole("button", { name: "Add Franchise" }).click();
  await expect(page.getByRole("heading")).toContainText("Create franchise");
  await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading")).toContainText("Mama Ricci's kitchen");
  await expect(page.locator("thead")).toContainText("Franchise");
  await expect(page.getByRole("table")).toContainText("Downtown Store");
  await expect(page.getByRole("table")).toContainText("Charlie");
  await expect(page.getByRole("table")).toContainText("Mama Ricci Suburbs");
  await expect(
    page.getByRole("row", { name: "Uptown Store ₿ Close" }).getByRole("button")
  ).toBeVisible();
});
