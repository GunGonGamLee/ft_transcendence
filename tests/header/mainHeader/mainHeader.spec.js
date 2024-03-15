import { test, expect } from "@playwright/test";

test.use({
  ignoreHTTPSErrors: true,
  viewport: { width: 1920, height: 1080 },
  javaScriptEnabled: true,
});

test.beforeEach(async ({ page, context, browser }) => {
  await context.addCookies([
    {
      name: "jwt",
      value: process.env.JWT_TOKEN,
      domain: "localhost",
      path: "/",
      httpOnly: true,
    },
  ]);
  await page.goto("/game-mode");
});

test.describe("Main Header", () => {
  test("should render main header", async ({ page }) => {
    const userInfoButton = page.getByRole("button", {
      name: "예나 아바타",
    });
    await userInfoButton.waitFor({ state: "visible" });
    await expect(userInfoButton).toHaveText("예나");
    // await page.getByText("사십 이 초-월").click();
    // await page.getByRole("img", { name: "뒤로가기" }).click();
    // await page.getByRole("img", { name: "친구 목록" }).click();
    // await page.getByRole("img", { name: "친구 목록" }).click();
    // await page.getByText("떠나기").click();
  });
});
