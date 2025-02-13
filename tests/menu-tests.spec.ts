import { fail } from "assert";
import { test, expect } from "playwright-test-coverage";

test("order page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Order" }).click();
  await expect(page.getByRole("heading")).toContainText(
    "Awesome is a click away"
  );
});

test("menu page", async ({ page }) => {
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

  await page.goto("http://localhost:5173/menu", {
    waitUntil: "domcontentloaded",
  });

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
});
