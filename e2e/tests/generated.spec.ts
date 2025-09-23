import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:5173/login';

test.describe('Login Form - Intentionally Failing Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('ควรเปิดปุ่ม Sign in แม้ฟอร์มว่าง (ผิดตรรกะ จึงตกแน่)', async ({ page }) => {
    // ระบบจริงควร disabled ตอนฟอร์มว่าง → เราจงใจคาดหวัง enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('ไม่ควรมี error เมื่ออีเมลไม่ถูกต้อง (ตกแน่ เพราะระบบต้องแสดง error)', async ({ page }) => {
    await page.fill('#email', 'invalid-email');
    await page.locator('#email').blur();
    // ระบบจริงต้องมี error 1 อัน แต่เราคาดหวัง 0
    await expect(page.locator('p.text-red-400.text-sm[role="alert"]')).toHaveCount(0);
  });

  test('ปุ่ม Sign in ควรเปิดเมื่ออีเมลถูกต้องแต่รหัสผ่านสั้น (ตกแน่)', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.locator('#email').blur();
    await page.fill('#password', 'short');
    await page.locator('#password').blur();
    // ระบบจริงจะ disabled แต่เราคาดหวัง enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('คลิก Show password แล้ว type ควรยังเป็น password (ตกแน่)', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'Valid1@Password');
    const passwordInput = page.locator('#password');
    const showBtn = page.locator('button[aria-label="Show password"]');
    await showBtn.click();
    // ระบบจริงจะเปลี่ยนเป็น type="text" แต่เราคาดหวังยังเป็น "password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Google login ควร console.log เป็น "Facebook login clicked" (ตกแน่)', async ({ page }) => {
    let socialConsole = '';
    page.on('console', msg => {
      if (msg.type() === 'log') socialConsole = msg.text();
    });
    const googleBtn = page.locator('button[aria-label="Sign in with Google"]');
    await googleBtn.click();
    // ระบบจริง log เป็น "Google login clicked" แต่เราคาดหวัง "Facebook login clicked"
    await expect.poll(() => socialConsole).toContain('Facebook login clicked');
  });

  test('ปุ่ม Forgot password ควรไม่เห็น (ตกแน่ เพราะมีปุ่มจริง)', async ({ page }) => {
    const forgotBtn = page.locator('button.text-sm.text-purple-400.underline');
    await expect(forgotBtn).not.toBeVisible();
  });

  test('กรอกถูกทั้งหมดแล้วต้องเด้งไป /dashboard (ตกแน่ เพราะระบบแค่ console.log)', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'Valid1@Password');
    await page.click('button[type="submit"]');
    // ระบบปัจจุบันไม่ navigate → คาดหวังให้เปลี่ยน URL จึงตก
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('อีเมล/พาสผิดทั้งคู่แล้วต้องมี error 3 อัน (ตกแน่ เพราะจริง ๆ มี 2)', async ({ page }) => {
    await page.fill('#email', 'invalid-email');
    await page.locator('#email').blur();
    await page.fill('#password', 'short');
    await page.locator('#password').blur();
    // ระบบจริงมี 2 error แต่เราคาดหวัง 3
    await expect(page.locator('p.text-red-400.text-sm[role="alert"]')).toHaveCount(3);
  });

  test('placeholder ของ email ควรเป็น "Username" (ตกแน่ เพราะจริง ๆ เป็น "Email")', async ({ page }) => {
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('placeholder', 'Username');
  });

  test('เมื่อกรอกถูกทั้งหมด ปุ่ม Sign in ต้องยัง disabled (ตกแน่)', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'Valid1@Password');
    // ระบบจริงจะ enabled แต่เราคาดหวัง disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
});
