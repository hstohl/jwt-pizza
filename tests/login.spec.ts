import { fail } from "assert";
import { test, expect } from "playwright-test-coverage";

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByRole("main")).toContainText(
    "So you want a piece of the pie?"
  );
});

test("about page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "About" })
    .click();
  await expect(page.getByRole("main")).toContainText("The secret sauce");
});

test("history page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "History" })
    .click();
  await expect(page.getByRole("main")).toContainText("Mama Rucci, my my");
});

test("login", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() == "PUT") {
      const loginReq = { email: "d@jwt.com", password: "a" };
      const loginRes = {
        user: {
          id: 3,
          name: "Kai Chen",
          email: "d@jwt.com",
          roles: [{ role: "diner" }],
        },
        token: "abcdef",
      };
      expect(route.request().method()).toBe("PUT");
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else if (route.request().method() == "DELETE") {
      // expect(route.request().headers()["Authorization"]).toBe("Bearer abcdef");
      const logoutRes = { message: "logout successful" };
      await route.fulfill({ json: logoutRes });
    } else {
      fail("unexpected request");
    }
  });

  await page.goto("/");

  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "Register" })).not.toBeVisible();
  await expect(page.locator("#navbar-dark")).toContainText("Logout");
  await expect(page.getByLabel("Global")).toContainText("name"); //it'll be chinese so change that
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
});
