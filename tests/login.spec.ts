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

test("docs page", async ({ page }) => {
  await page.goto("/docs/factory");
  await expect(page.getByRole("main")).toContainText("JWT Pizza API");
  await expect(page.getByText("🔐 [POST] /api/orderCreate a")).toBeVisible();
  await expect(page.getByRole("main")).toContainText(
    '{ "keys": [ { "kty": "RSA", "kid": "KID here", "n": "Key value here", "e": "AQAB" } ] }'
  );
  await expect(page.getByRole("main")).toContainText(
    "[GET] /api/support/:vendorToken/report/:fixCode"
  );
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
      //expect(route.request().headers()["Authorization"]).toBe("Bearer abcdef");
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
  await expect(page.getByLabel("Global")).toContainText("KC");
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
});

test("diner dashboard no orders", async ({ page }) => {
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
      //expect(route.request().headers()["Authorization"]).toBe("Bearer abcdef");
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
  await expect(page.getByLabel("Global")).toContainText("KC");

  await page.getByRole("link", { name: "KC" }).click();
  await page.getByText("Your pizza kitchen").click();
  await page.getByText("Kai Chen").click();
  await page.getByText("diner", { exact: true }).click();
  await page.getByRole("link", { name: "Buy one" }).click();
  await page.getByText("Awesome is a click away").click();
});

test("diner dashboard", async ({ page }) => {
  await page.route("http://localhost:3000/api/order", async (route) => {
    const mockOrdersResponse = {
      orders: [
        {
          id: "12345",
          items: [
            { menuId: 1, description: "Margherita Pizza", price: 9.99 },
            { menuId: 2, description: "Pepperoni Pizza", price: 11.99 },
          ],
          date: new Date("2025-02-10T18:30:00Z").toISOString(),
        },
        {
          id: "67890",
          items: [
            { menuId: 3, description: "BBQ Chicken Pizza", price: 12.99 },
          ],
          date: new Date("2025-02-08T14:15:00Z").toISOString(),
        },
      ],
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockOrdersResponse),
    });
  });

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
      //expect(route.request().headers()["Authorization"]).toBe("Bearer abcdef");
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
  await expect(page.getByLabel("Global")).toContainText("KC");

  await page.getByRole("link", { name: "KC" }).click();
  await page.getByText("Your pizza kitchen").click();
  await page.getByText("Kai Chen").click();
  await page.getByText("diner", { exact: true }).click();
  await expect(page.getByRole("main")).toContainText(
    "Here is your history of all the good times."
  );
  await expect(page.getByRole("columnheader", { name: "Date" })).toBeVisible();
  await expect(page.locator("tbody")).toContainText("12345");
});
