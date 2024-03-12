import { test, expect } from "@playwright/test";

test.use({
  ignoreHTTPSErrors: true,
  viewport: { width: 1920, height: 1080 },
  javaScriptEnabled: true,
});

test("test", async ({ page, browser }) => {
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "jwt",
      value: process.env.JWT_TOKEN,
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/game-mode");
  await context.close();
});
