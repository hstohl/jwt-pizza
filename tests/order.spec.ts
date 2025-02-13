import { fail } from "assert";
import { test, expect } from "playwright-test-coverage";

test("order pizza", async ({ page }) => {
  await page.route("http://localhost:3000/api/order/menu", async (route) => {
    const mockMenuResponse = [
      {
        id: 1,
        title: "Margherita",
        description: "Tomato, Mozzarella, Basil",
        price: 9.99,
        image: "margherita.jpg",
      },
      {
        id: 2,
        title: "Pepperoni",
        description: "Tomato, Mozzarella, Pepperoni",
        price: 11.99,
        image: "pepperoni.jpg",
      },
      {
        id: 3,
        title: "BBQ Chicken",
        description: "BBQ Sauce, Chicken, Red Onion",
        price: 12.99,
        image: "bbq.jpg",
      },
    ];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockMenuResponse),
    });
  });

  await page.route("http://localhost:3000/api/franchise", async (route) => {
    const mockFranchiseResponse = [
      {
        id: "1",
        name: "Pizza Palace",
        stores: [{ id: "101", name: "Downtown Pizza" }],
      },
      {
        id: "2",
        name: "Pasta & Pizza",
        stores: [{ id: "102", name: "Uptown Pizza" }],
      },
      {
        id: "3",
        name: "Italiano Express",
        stores: [{ id: "103", name: "Bay Area Pizza" }],
      },
    ];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockFranchiseResponse),
    });
  });

  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() === "PUT") {
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

      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else {
      fail("unexpected request");
    }
  });

  await page.route("*/**/api/order", async (route) => {
    if (route.request().method() === "POST") {
      const orderReq = {
        items: [
          {
            menuId: 1,
            description: "Margherita",
            price: 9.99,
          },
        ],
        storeId: "101",
        franchiseId: "1",
      };
      const orderRes = {
        order: {
          items: [
            {
              menuId: 1,
              description: "Margherita",
              price: 9.99,
            },
          ],
          storeId: "101",
          franchiseId: 1,
          id: 14,
        },
        jwt: "verification",
      };

      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
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

  await page.getByRole("button", { name: "Order now" }).click();

  const menuData = await page.evaluate(async () => {
    const response = await fetch("http://localhost:3000/api/order/menu");
    return response.json();
  });

  const franchiseData = await page.evaluate(async () => {
    const response = await fetch("http://localhost:3000/api/franchise");
    return response.json();
  });

  expect(menuData).toHaveLength(3);
  expect(menuData[0].title).toBe("Margherita");
  expect(franchiseData).toHaveLength(3);
  expect(franchiseData[0].name).toBe("Pizza Palace");

  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await expect(page.locator("select")).toContainText("Downtown Pizza");
  await expect(page.locator("form")).toContainText("Margherita");

  await page.getByRole("combobox").selectOption("101");
  await page
    .getByRole("link", { name: "Image Description Margherita" })
    .click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 1");
  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByRole("heading")).toContainText("So worth it");
  await expect(page.getByRole("main")).toContainText("Pay now");

  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page.getByRole("heading")).toContainText(
    "Here is your JWT Pizza!"
  );
  await expect(page.getByRole("main")).toContainText("order ID:");
  await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.locator("pre")).toContainText(
    '{ "error": "invalid JWT. Looks like you have a bad pizza!" }'
  );
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("main")).toContainText("verification");
  await page.getByRole("button", { name: "Order more" }).click();
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
});
