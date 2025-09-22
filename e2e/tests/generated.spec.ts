import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:5174/login';

test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
});

test('TC001 - Verify that the email input field is present and has the correct aria-label.', async ({ page }) => {
    const emailInput = await page.locator('#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('aria-label', 'Enter your email');
});

test('TC002 - Verify that the password input field is present and has the correct aria-label.', async ({ page }) => {
    const passwordInput = await page.locator('#password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('aria-label', 'Enter your password');
});

test('TC003 - Verify that the "Hide password" button is present and has the correct aria-label.', async ({ page }) => {
    const hidePasswordButton = await page.locator('[aria-label="Hide password"]');
    await expect(hidePasswordButton).toBeVisible();
});

test('TC004 - Verify that the "Show password" button is present and has the correct aria-label.', async ({ page }) => {
    const showPasswordButton = await page.locator('[aria-label="Show password"]');
    await expect(showPasswordButton).toBeVisible();
});

test('TC005 - Verify that the "Forgot password?" link is present and has the correct aria-label.', async ({ page }) => {
    const forgotPasswordLink = await page.locator('[aria-label="Forgot password?"]');
    await expect(forgotPasswordLink).toBeVisible();
});

test('TC006 - Verify that the "Go to slide 1" indicator is present and has the correct aria-label.', async ({ page }) => {
    const slide1Indicator = await page.locator('[aria-label="Go to slide 1"]');
    await expect(slide1Indicator).toBeVisible();
});

test('TC007 - Verify that the "Go to slide 2" indicator is present and has the correct aria-label.', async ({ page }) => {
    const slide2Indicator = await page.locator('[aria-label="Go to slide 2"]');
    await expect(slide2Indicator).toBeVisible();
});

test('TC008 - Verify that the "Go to slide 3" indicator is present and has the correct aria-label.', async ({ page }) => {
    const slide3Indicator = await page.locator('[aria-label="Go to slide 3"]');
    await expect(slide3Indicator).toBeVisible();
});

test('TC009 - Verify that the "Back to website" button is present and has the correct aria-label.', async ({ page }) => {
    const backToWebsiteButton = await page.locator('[aria-label="Back to website"]');
    await expect(backToWebsiteButton).toBeVisible();
});