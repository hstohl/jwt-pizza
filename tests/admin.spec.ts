import { fail } from "assert";
import { test, expect } from "playwright-test-coverage";

test("login", async ({ page }) => {
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
  await page.getByRole("link", { name: "FJ" }).click();
  await page.getByText("admin", { exact: true }).click();
  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByText("Mama Ricci's kitchen").click();
  await page
    .getByRole("columnheader", { name: "Franchise", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add Franchise" })
  ).toBeVisible();
});
