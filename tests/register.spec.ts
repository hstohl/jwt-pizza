import { fail } from "assert";
import { test, expect } from "playwright-test-coverage";

test("register", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() == "POST") {
      const regReq = {
        email: "treelover@jwt.com",
        password: "evan",
        role: "diner",
      };
      const regRes = {
        user: {
          id: 3,
          name: "Connor Murphy",
          email: "treelover@jwt.com",
          roles: [{ role: "diner" }],
        },
        token: "abcdef",
      };
      expect(route.request().method()).toBe("POST");
      //   expect(route.request().postDataJSON()).toMatchObject(regReq);
      await route.fulfill({ json: regRes });
    }
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await expect(page.getByRole("heading")).toContainText("Welcome to the party");
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  await expect(page.locator("form")).toContainText(
    "Already have an account? Login instead."
  );
  await page.getByRole("textbox", { name: "Full name" }).fill("Connor Murphy");
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("treelover@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("evan");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByLabel("Global")).toContainText("CM");
  await expect(page.getByRole("link", { name: "CM" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).not.toBeVisible();
});
