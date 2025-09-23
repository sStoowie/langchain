import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:5173/login';

test.describe('Login Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('ปุ่ม Sign in ถูกปิดการใช้งานเมื่อฟอร์มว่างทั้งหมด', async ({ page }) => {
    await test.step('ตรวจสอบปุ่ม Sign in disabled เมื่อฟอร์มว่าง', async () => {
      const submitButton = page.locator('button[type="submit"].w-full.bg-purple-600');
      await expect(submitButton).toBeDisabled({ timeout: 5000 });
    });
  });

  test('แสดงข้อความ error เมื่ออีเมลไม่ถูกต้อง (ขณะกรอกรหัสผ่านถูกต้อง)', async ({ page }) => {
    await test.step('กรอกอีเมลผิด + รหัสผ่านถูก', async () => {
      await page.fill('#email', 'invalid-email');
      await page.locator('#email').blur();
      await page.fill('#password', 'ValidPass1!');
      await page.locator('#password').blur();
    });

    const error = page.getByRole('alert');
    await error.waitFor({ state: 'visible' });
    await expect(error).toContainText('กรุณากรอกอีเมลให้ถูกต้อง');

    const submitButton = page.locator('button[type="submit"].w-full.bg-purple-600');
    await expect(submitButton).toBeDisabled({ timeout: 5000 });
  });

  test('แสดงข้อความ error เมื่อรหัสผ่านไม่ถูกต้อง (ขณะกรอกอีเมลถูกต้อง)', async ({ page }) => {
    await test.step('กรอกอีเมลถูกต้อง + รหัสผ่านผิด', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'short');
      await page.locator('#password').blur();
    });

    const error = page.getByRole('alert');
    await error.waitFor({ state: 'visible' });
    await expect(error).toContainText('รหัสผ่านต้อง ≥ 8 ตัว มีตัวพิมพ์เล็ก/ใหญ่ ตัวเลข และอักขระพิเศษ');

    const submitButton = page.locator('button[type="submit"].w-full.bg-purple-600');
    await expect(submitButton).toBeDisabled({ timeout: 5000 });
  });

  test('ปุ่ม Sign in ถูกปิดการใช้งานเมื่อกรอกอีเมลถูกต้องแต่รหัสผ่านผิด', async ({ page }) => {
    await test.step('กรอกอีเมลถูกต้อง + รหัสผ่านผิด', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', '123');
      await page.locator('#password').blur();
    });

    const submitButton = page.locator('button[type="submit"].w-full.bg-purple-600');
    await expect(submitButton).toBeDisabled({ timeout: 5000 });
  });

  test('ปุ่ม Sign in ถูกปิดการใช้งานเมื่อกรอกรหัสผ่านถูกต้องแต่อีเมลผิด', async ({ page }) => {
    await test.step('กรอกอีเมลผิด + รหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'not-an-email');
      await page.locator('#email').blur();
      await page.fill('#password', 'ValidPass1!');
      await page.locator('#password').blur();
    });

    const submitButton = page.locator('button[type="submit"].w-full.bg-purple-600');
    await expect(submitButton).toBeDisabled({ timeout: 5000 });
  });

  test('เข้าสู่ระบบได้เมื่อกรอกอีเมลและรหัสผ่านถูกต้องทั้งหมด', async ({ page }) => {
    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'ValidPass1!');
      await page.locator('#password').blur();
    });

    const submitButton = page.locator('button[type="submit"].w-full.bg-purple-600');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    await test.step('คลิกปุ่ม Sign in', async () => {
      await submitButton.click();
    });
  });

  test('แสดง/ซ่อนรหัสผ่านเมื่อกดปุ่ม Show/Hide password', async ({ page }) => {
    await test.step('กรอกข้อมูลครบทั้งสองฟิลด์', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'ValidPass1!');
      await page.locator('#password').blur();
    });

    const passwordInput = page.locator('#password');
    await passwordInput.waitFor({ state: 'visible' });

    await test.step('กดปุ่ม Show password', async () => {
      const showButton = page.locator('button.absolute.right-3[aria-label="Show password"]');
      await showButton.waitFor({ state: 'visible' });
      await showButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text', { timeout: 5000 });
    });

    await test.step('กดปุ่ม Hide password', async () => {
      const hideButton = page.locator('button.absolute.right-3[aria-label="Hide password"]');
      await hideButton.waitFor({ state: 'visible' });
      await hideButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password', { timeout: 5000 });
    });
  });
});